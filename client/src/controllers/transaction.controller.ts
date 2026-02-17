import { create } from 'zustand';
import { Transaction } from '../models/types';
import { transactionService } from '../services/transaction.service';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchTransactions: (accountId?: number) => Promise<void>;
  deposit: (
    accountId: number,
    amount: number,
    description?: string,
  ) => Promise<void>;
  withdraw: (
    accountId: number,
    amount: number,
    description?: string,
  ) => Promise<void>;
  transfer: (
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description?: string,
  ) => Promise<void>;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (accountId) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionService.getHistory(accountId);
      set({ transactions, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  deposit: async (accountId, amount, description) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionService.deposit({
        accountId,
        amount,
        description,
      });
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Deposit failed',
        isLoading: false,
      });
      throw error;
    }
  },

  withdraw: async (accountId, amount, description) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionService.withdraw({
        accountId,
        amount,
        description,
      });
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Withdrawal failed',
        isLoading: false,
      });
      throw error;
    }
  },

  transfer: async (fromAccountId, toAccountId, amount, description) => {
    set({ isLoading: true, error: null });
    try {
      const newTransaction = await transactionService.transfer({
        fromAccountId,
        toAccountId,
        amount,
        description,
      });
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Transfer failed',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
