import { create } from 'zustand';
import { loanOfficerService } from '../services/loan-officer.service';

interface LoanOfficerState {
  pendingLoans: any[];
  approvedLoans: any[];
  overdueLoans: any[];
  allLoans: any[];
  selectedLoan: any | null;
  repaymentSchedule: any[];
  paymentHistory: any[];
  penalties: any[];
  dashboardStats: any | null;
  searchResults: any[];
  isLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchPendingLoans: () => Promise<void>;
  fetchApprovedLoans: () => Promise<void>;
  fetchOverdueLoans: () => Promise<void>;
  fetchAllLoans: (params?: {
    status?: string;
    loanType?: string;
  }) => Promise<void>;
  selectLoan: (id: number) => Promise<void>;
  clearSelectedLoan: () => void;

  approveLoan: (
    loanId: number,
    data: { approvalNotes: string; recommendedEMI?: string },
  ) => Promise<void>;
  rejectLoan: (loanId: number, reason: string) => Promise<void>;
  addRemarks: (loanId: number, remarks: string) => Promise<void>;
  searchByCustomer: (name: string) => Promise<void>;
  waivePenalty: (penaltyId: number, remarks?: string) => Promise<void>;
  collectPenalty: (penaltyId: number) => Promise<void>;
  runPenaltyCheck: () => Promise<any>;

  clearMessages: () => void;
}

export const useLoanOfficerStore = create<LoanOfficerState>((set, get) => ({
  pendingLoans: [],
  approvedLoans: [],
  overdueLoans: [],
  allLoans: [],
  selectedLoan: null,
  repaymentSchedule: [],
  paymentHistory: [],
  penalties: [],
  dashboardStats: null,
  searchResults: [],
  isLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const [stats, pending, overdue] = await Promise.all([
        loanOfficerService.getDashboardOverview(),
        loanOfficerService.getPendingLoans(),
        loanOfficerService.getOverdueLoans(),
      ]);
      set({
        dashboardStats: stats,
        pendingLoans: Array.isArray(pending) ? pending : [],
        overdueLoans: Array.isArray(overdue) ? overdue : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load dashboard',
        isLoading: false,
      });
    }
  },

  fetchPendingLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const loans = await loanOfficerService.getPendingLoans();
      set({
        pendingLoans: Array.isArray(loans) ? loans : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch pending loans',
        isLoading: false,
      });
    }
  },

  fetchApprovedLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const loans = await loanOfficerService.getApprovedLoans();
      set({
        approvedLoans: Array.isArray(loans) ? loans : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch approved loans',
        isLoading: false,
      });
    }
  },

  fetchOverdueLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const loans = await loanOfficerService.getOverdueLoans();
      set({
        overdueLoans: Array.isArray(loans) ? loans : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch overdue loans',
        isLoading: false,
      });
    }
  },

  fetchAllLoans: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const loans = await loanOfficerService.getAllLoans(params);
      set({ allLoans: Array.isArray(loans) ? loans : [], isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch loans',
        isLoading: false,
      });
    }
  },

  selectLoan: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const [details, schedule, history, penalties] = await Promise.all([
        loanOfficerService.getLoanDetails(id),
        loanOfficerService.getRepaymentSchedule(id),
        loanOfficerService.getPaymentHistory(id),
        loanOfficerService.getLoanPenalties(id),
      ]);
      set({
        selectedLoan: details,
        repaymentSchedule: Array.isArray(schedule) ? schedule : [],
        paymentHistory: Array.isArray(history) ? history : [],
        penalties: Array.isArray(penalties) ? penalties : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load loan details',
        isLoading: false,
      });
    }
  },

  clearSelectedLoan: () =>
    set({
      selectedLoan: null,
      repaymentSchedule: [],
      paymentHistory: [],
      penalties: [],
    }),

  approveLoan: async (loanId, data) => {
    set({ actionLoading: true, error: null });
    try {
      await loanOfficerService.approveLoan(loanId, data);
      set({
        actionLoading: false,
        successMessage: 'Loan approved successfully',
      });
      // Refresh lists
      get().fetchDashboard();
      if (get().selectedLoan?.id === loanId) get().selectLoan(loanId);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to approve loan',
        actionLoading: false,
      });
    }
  },

  rejectLoan: async (loanId, reason) => {
    set({ actionLoading: true, error: null });
    try {
      await loanOfficerService.rejectLoan(loanId, { rejectionReason: reason });
      set({ actionLoading: false, successMessage: 'Loan rejected' });
      get().fetchDashboard();
      if (get().selectedLoan?.id === loanId) get().selectLoan(loanId);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to reject loan',
        actionLoading: false,
      });
    }
  },

  addRemarks: async (loanId, remarks) => {
    set({ actionLoading: true, error: null });
    try {
      await loanOfficerService.addRemarks(loanId, remarks);
      set({ actionLoading: false, successMessage: 'Remarks added' });
      if (get().selectedLoan?.id === loanId) get().selectLoan(loanId);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to add remarks',
        actionLoading: false,
      });
    }
  },

  searchByCustomer: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const results = await loanOfficerService.searchLoansByCustomer(name);
      set({
        searchResults: Array.isArray(results) ? results : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Search failed',
        isLoading: false,
      });
    }
  },

  waivePenalty: async (penaltyId: number, remarks?: string) => {
    set({ actionLoading: true, error: null });
    try {
      await loanOfficerService.waivePenalty(penaltyId, remarks);
      set({ actionLoading: false, successMessage: 'Penalty waived' });
      // Refresh penalties for current loan
      const selected = get().selectedLoan;
      if (selected) {
        const penalties = await loanOfficerService.getLoanPenalties(
          selected.id,
        );
        const loanDetails = await loanOfficerService.getLoanDetails(
          selected.id,
        );
        set({
          penalties: Array.isArray(penalties) ? penalties : [],
          selectedLoan: loanDetails,
        });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to waive penalty',
        actionLoading: false,
      });
    }
  },

  collectPenalty: async (penaltyId: number) => {
    set({ actionLoading: true, error: null });
    try {
      await loanOfficerService.collectPenalty(penaltyId);
      set({
        actionLoading: false,
        successMessage: 'Penalty marked as collected',
      });
      const selected = get().selectedLoan;
      if (selected) {
        const penalties = await loanOfficerService.getLoanPenalties(
          selected.id,
        );
        set({ penalties: Array.isArray(penalties) ? penalties : [] });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to collect penalty',
        actionLoading: false,
      });
    }
  },

  runPenaltyCheck: async () => {
    set({ actionLoading: true, error: null });
    try {
      const result = await loanOfficerService.runPenaltyCheck();
      set({
        actionLoading: false,
        successMessage: `Penalty check done — ${result.penaltiesCreated ?? 0} new, ${result.penaltiesUpdated ?? 0} updated`,
      });
      return result;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Penalty check failed',
        actionLoading: false,
      });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
