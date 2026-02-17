import { create } from 'zustand';
import { Account } from '../models/types';
import { accountService } from '../services/account.service';

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  error: string | null;

  fetchAccounts: () => Promise<void>;
  createAccount: (accountType: 'SAVINGS' | 'CHECKING') => Promise<void>;
  selectAccount: (account: Account | null) => void;
  clearError: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountService.getAll();
      set({ accounts, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch accounts',
        isLoading: false,
      });
    }
  },

  createAccount: async (accountType) => {
    set({ isLoading: true, error: null });
    try {
      const newAccount = await accountService.create(accountType);
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create account',
        isLoading: false,
      });
      throw error;
    }
  },

  selectAccount: (account) => set({ selectedAccount: account }),

  clearError: () => set({ error: null }),
}));

// Helper object for easier access
export const accountController = {
  loadAccounts: () => useAccountStore.getState().fetchAccounts(),
  createAccount: (type: 'SAVINGS' | 'CHECKING') =>
    useAccountStore.getState().createAccount(type),
  createFixedDeposit: async (
    amount: number,
    lockPeriodMonths: number,
    interestRate?: number,
  ) => {
    const newAccount = await accountService.createFixedDeposit(
      amount,
      lockPeriodMonths,
      interestRate,
    );
    // Refresh accounts list
    await useAccountStore.getState().fetchAccounts();
    return newAccount;
  },
  createRecurringDeposit: async (
    monthlyAmount: number,
    lockPeriodMonths: number,
    interestRate?: number,
  ) => {
    const newAccount = await accountService.createRecurringDeposit(
      monthlyAmount,
      lockPeriodMonths,
      interestRate,
    );
    // Refresh accounts list
    await useAccountStore.getState().fetchAccounts();
    return newAccount;
  },
  getAccounts: () => useAccountStore.getState().accounts,
  selectAccount: (account: Account | null) =>
    useAccountStore.getState().selectAccount(account),
};
