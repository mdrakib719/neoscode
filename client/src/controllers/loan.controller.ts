import { create } from 'zustand';
import { Loan } from '../models/types';
import { loanService } from '../services/loan.service';

interface LoanState {
  loans: Loan[];
  selectedLoan: Loan | null;
  isLoading: boolean;
  error: string | null;

  fetchLoans: () => Promise<void>;
  applyLoan: (
    loanType: 'PERSONAL' | 'HOME' | 'VEHICLE' | 'EDUCATION',
    amount: number,
    interestRate: number,
    tenureMonths: number,
  ) => Promise<void>;
  approveLoan: (id: number, remarks?: string) => Promise<void>;
  rejectLoan: (id: number, remarks: string) => Promise<void>;
  selectLoan: (loan: Loan | null) => void;
  clearError: () => void;
}

export const useLoanStore = create<LoanState>((set) => ({
  loans: [],
  selectedLoan: null,
  isLoading: false,
  error: null,

  fetchLoans: async () => {
    set({ isLoading: true, error: null });
    try {
      const loans = await loanService.getAll();
      set({ loans, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch loans',
        isLoading: false,
      });
    }
  },

  applyLoan: async (loanType, amount, interestRate, tenureMonths) => {
    set({ isLoading: true, error: null });
    try {
      const newLoan = await loanService.apply({
        loan_type: loanType,
        amount,
        interest_rate: interestRate,
        tenure_months: tenureMonths,
      });
      set((state) => ({
        loans: [...state.loans, newLoan],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Loan application failed',
        isLoading: false,
      });
      throw error;
    }
  },

  approveLoan: async (id, remarks) => {
    set({ isLoading: true, error: null });
    try {
      const updatedLoan = await loanService.approve(id, remarks);
      set((state) => ({
        loans: state.loans.map((loan) => (loan.id === id ? updatedLoan : loan)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to approve loan',
        isLoading: false,
      });
      throw error;
    }
  },

  rejectLoan: async (id, remarks) => {
    set({ isLoading: true, error: null });
    try {
      const updatedLoan = await loanService.reject(id, remarks);
      set((state) => ({
        loans: state.loans.map((loan) => (loan.id === id ? updatedLoan : loan)),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to reject loan',
        isLoading: false,
      });
      throw error;
    }
  },

  selectLoan: (loan) => set({ selectedLoan: loan }),

  clearError: () => set({ error: null }),
}));

// Helper controller object for easier component access
export const loanController = {
  loadLoans: () => useLoanStore.getState().fetchLoans(),

  applyLoan: (data: {
    loan_type: string;
    amount: number;
    tenure_months: number;
  }) => {
    // Calculate interest rate based on loan type
    const calculateInterestRate = (loanType: string): number => {
      switch (loanType) {
        case 'PERSONAL':
          return 12;
        case 'HOME':
          return 8;
        case 'VEHICLE':
          return 10;
        case 'EDUCATION':
          return 9;
        default:
          return 12;
      }
    };

    const interestRate = calculateInterestRate(data.loan_type);

    // Use loanService.apply directly which sends the correct snake_case format
    return loanService.apply({
      loan_type: data.loan_type as
        | 'PERSONAL'
        | 'HOME'
        | 'VEHICLE'
        | 'EDUCATION',
      amount: data.amount,
      interest_rate: interestRate,
      tenure_months: data.tenure_months,
    });
  },

  getLoans: () => useLoanStore.getState().loans,

  selectLoan: (loan: Loan | null) => useLoanStore.getState().selectLoan(loan),

  payEMI: (loanId: number, accountId: number, amount?: number) =>
    loanService.payEMI(loanId, accountId, amount),
};
