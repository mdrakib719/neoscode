import { create } from 'zustand';
import { staffService } from '../services/staff.service';

interface StaffState {
  customers: any[];
  selectedCustomer: any | null;
  customerAccounts: any[];
  customerTransactions: any[];
  isLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  fetchAllCustomers: () => Promise<void>;
  searchCustomers: (query: string) => Promise<void>;
  selectCustomer: (id: number) => Promise<void>;
  clearSelectedCustomer: () => void;

  freezeAccount: (accountId: number, reason: string) => Promise<void>;
  unfreezeAccount: (accountId: number) => Promise<void>;

  performDeposit: (
    customerId: number,
    amount: number,
    description?: string,
  ) => Promise<void>;
  performWithdrawal: (
    customerId: number,
    amount: number,
    description?: string,
  ) => Promise<void>;
  performTransfer: (
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description?: string,
  ) => Promise<void>;

  clearMessages: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  customerAccounts: [],
  customerTransactions: [],
  isLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null,

  fetchAllCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const customers = await staffService.getAllCustomers();
      set({
        customers: Array.isArray(customers) ? customers : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch customers',
        isLoading: false,
      });
    }
  },

  searchCustomers: async (query: string) => {
    if (!query.trim()) {
      return get().fetchAllCustomers();
    }
    set({ isLoading: true, error: null });
    try {
      const customers = await staffService.searchCustomers(query);
      set({
        customers: Array.isArray(customers) ? customers : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Search failed',
        isLoading: false,
      });
    }
  },

  selectCustomer: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const [details, accounts, transactions] = await Promise.all([
        staffService.getCustomerDetails(id),
        staffService.getCustomerAccounts(id),
        staffService.getCustomerTransactions(id, 20),
      ]);
      set({
        selectedCustomer: details,
        customerAccounts: Array.isArray(accounts) ? accounts : [],
        customerTransactions: Array.isArray(transactions) ? transactions : [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to load customer',
        isLoading: false,
      });
    }
  },

  clearSelectedCustomer: () =>
    set({
      selectedCustomer: null,
      customerAccounts: [],
      customerTransactions: [],
    }),

  freezeAccount: async (accountId: number, reason: string) => {
    set({ actionLoading: true, error: null });
    try {
      await staffService.freezeAccount(accountId, reason);
      set({
        actionLoading: false,
        successMessage: 'Account frozen successfully',
      });
      const { selectedCustomer } = get();
      if (selectedCustomer) get().selectCustomer(selectedCustomer.id);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to freeze account',
        actionLoading: false,
      });
    }
  },

  unfreezeAccount: async (accountId: number) => {
    set({ actionLoading: true, error: null });
    try {
      await staffService.unfreezeAccount(accountId);
      set({
        actionLoading: false,
        successMessage: 'Account unfrozen successfully',
      });
      const { selectedCustomer } = get();
      if (selectedCustomer) get().selectCustomer(selectedCustomer.id);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to unfreeze account',
        actionLoading: false,
      });
    }
  },

  performDeposit: async (
    customerId: number,
    amount: number,
    description?: string,
  ) => {
    set({ actionLoading: true, error: null });
    try {
      await staffService.performDeposit({
        customerId,
        amount,
        notes: description,
      });
      set({
        actionLoading: false,
        successMessage: `Deposit of $${amount} completed`,
      });
      const { selectedCustomer } = get();
      if (selectedCustomer) get().selectCustomer(selectedCustomer.id);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Deposit failed',
        actionLoading: false,
      });
    }
  },

  performWithdrawal: async (
    customerId: number,
    amount: number,
    description?: string,
  ) => {
    set({ actionLoading: true, error: null });
    try {
      await staffService.performWithdrawal({
        customerId,
        amount,
        notes: description,
      });
      set({
        actionLoading: false,
        successMessage: `Withdrawal of $${amount} completed`,
      });
      const { selectedCustomer } = get();
      if (selectedCustomer) get().selectCustomer(selectedCustomer.id);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Withdrawal failed',
        actionLoading: false,
      });
    }
  },

  performTransfer: async (
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    description?: string,
  ) => {
    set({ actionLoading: true, error: null });
    try {
      await staffService.performTransfer({
        fromAccountId,
        toAccountId,
        amount,
        notes: description,
      });
      set({
        actionLoading: false,
        successMessage: `Transfer of $${amount} completed`,
      });
      const { selectedCustomer } = get();
      if (selectedCustomer) get().selectCustomer(selectedCustomer.id);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Transfer failed',
        actionLoading: false,
      });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));
