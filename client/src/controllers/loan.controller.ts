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
        loanType,
        amount,
        interestRate,
        tenureMonths,
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
