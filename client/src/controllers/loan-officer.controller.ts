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
      const [details, schedule, history] = await Promise.all([
        loanOfficerService.getLoanDetails(id),
        loanOfficerService.getRepaymentSchedule(id),
        loanOfficerService.getPaymentHistory(id),
      ]);
      set({
        selectedLoan: details,
        repaymentSchedule: Array.isArray(schedule) ? schedule : [],
        paymentHistory: Array.isArray(history) ? history : [],
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
    set({ selectedLoan: null, repaymentSchedule: [], paymentHistory: [] }),

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

  clearMessages: () => set({ error: null, successMessage: null }),
}));
