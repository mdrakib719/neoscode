import { create } from 'zustand';
import { reportsService } from '../services/reports.service';

interface ReportsState {
  // Data
  userAccounts: any[];
  statement: any | null;
  accountSummary: any | null;
  // UI state
  selectedAccountId: number | null;
  selectedYear: number;
  selectedMonth: number;
  isLoading: boolean;
  isDownloading: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  loadUserAccounts: () => Promise<void>;
  fetchStatement: (
    accountId: number,
    year: number,
    month: number,
  ) => Promise<void>;
  downloadPDF: (
    accountId: number,
    year: number,
    month: number,
  ) => Promise<void>;
  setSelectedAccount: (id: number) => void;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
  clearMessages: () => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  userAccounts: [],
  statement: null,
  accountSummary: null,
  selectedAccountId: null,
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,
  isLoading: false,
  isDownloading: false,
  error: null,
  successMessage: null,

  loadUserAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await reportsService.getUserAccounts();
      const list = Array.isArray(accounts) ? accounts : [];
      set({
        userAccounts: list,
        // Auto-select the first account if nothing is selected yet
        selectedAccountId:
          get().selectedAccountId ?? (list.length > 0 ? list[0].id : null),
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load accounts',
        isLoading: false,
      });
    }
  },

  fetchStatement: async (accountId, year, month) => {
    set({ isLoading: true, error: null, statement: null });
    try {
      const data = await reportsService.getMonthlyStatement(
        accountId,
        year,
        month,
      );
      set({ statement: data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to generate statement',
        isLoading: false,
      });
    }
  },

  downloadPDF: async (accountId, year, month) => {
    set({ isDownloading: true, error: null });
    try {
      await reportsService.downloadPDFStatement(accountId, year, month);
      set({
        isDownloading: false,
        successMessage: 'PDF downloaded successfully',
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to download PDF',
        isDownloading: false,
      });
    }
  },

  setSelectedAccount: (id) => set({ selectedAccountId: id, statement: null }),
  setYear: (year) => set({ selectedYear: year, statement: null }),
  setMonth: (month) => set({ selectedMonth: month, statement: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));
