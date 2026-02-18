import { create } from 'zustand';
import { adminService } from '../services/admin.service';

interface AdminState {
  users: any[];
  accounts: any[];
  transactions: any[];
  auditLogs: any[];
  systemConfig: any;
  loading: boolean;
  error: string | null;

  // User Management
  getAllUsers: () => Promise<void>;
  createEmployee: (data: any) => Promise<void>;
  activateUser: (
    userId: number,
    isActive: boolean,
    reason?: string,
  ) => Promise<void>;
  lockUser: (
    userId: number,
    isLocked: boolean,
    reason?: string,
  ) => Promise<void>;
  unlockUser: (userId: number, reason?: string) => Promise<void>;
  assignRole: (userId: number, role: string) => Promise<void>;
  resetPassword: (userId: number, newPassword: string) => Promise<void>;

  // Account Oversight
  getAllAccounts: (page?: number) => Promise<void>;
  freezeAccount: (
    accountId: number,
    isFrozen: boolean,
    reason?: string,
  ) => Promise<void>;
  closeAccount: (accountId: number, reason: string) => Promise<void>;
  modifyAccountLimits: (accountId: number, limits: any) => Promise<void>;

  // Transaction Monitoring
  getAllTransactions: (page?: number, status?: string) => Promise<void>;
  reverseTransaction: (transactionId: number, reason: string) => Promise<void>;
  setTransactionLimits: (limits: any) => Promise<void>;
  setFeeConfiguration: (fees: any) => Promise<void>;

  // System Configuration
  getSystemConfig: () => Promise<void>;
  setInterestRate: (data: any) => Promise<void>;
  setLoanInterestRate: (data: any) => Promise<void>;
  setPenaltyRules: (data: any) => Promise<void>;

  // Security & Audit
  getAuditLogs: (
    page?: number,
    userId?: number,
    action?: string,
  ) => Promise<void>;
  getLoginActivity: (days?: number) => Promise<void>;
  getSuspiciousActivity: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  accounts: [],
  transactions: [],
  auditLogs: [],
  systemConfig: null,
  loading: false,
  error: null,

  // User Management
  getAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adminService.getAllUsers();
      console.log('getAllUsers response:', response);
      set({ users: (response as any[]) || [], loading: false });
    } catch (error: any) {
      console.error('getAllUsers error:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch users',
        loading: false,
      });
    }
  },

  createEmployee: async (data) => {
    set({ loading: true, error: null });
    try {
      await adminService.createEmployee(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create employee',
        loading: false,
      });
      throw error;
    }
  },

  activateUser: async (userId, isActive, reason) => {
    set({ loading: true, error: null });
    try {
      await adminService.activateUser(userId, { isActive, reason });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update user status',
        loading: false,
      });
      throw error;
    }
  },

  lockUser: async (userId, isLocked, reason) => {
    set({ loading: true, error: null });
    try {
      await adminService.lockUser(userId, { isLocked, reason });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to lock user',
        loading: false,
      });
      throw error;
    }
  },

  unlockUser: async (userId, reason) => {
    set({ loading: true, error: null });
    try {
      await adminService.unlockUser(userId, { reason });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to unlock user',
        loading: false,
      });
      throw error;
    }
  },

  assignRole: async (userId, role) => {
    set({ loading: true, error: null });
    try {
      await adminService.assignRole(userId, { role });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to assign role',
        loading: false,
      });
      throw error;
    }
  },

  resetPassword: async (userId, newPassword) => {
    set({ loading: true, error: null });
    try {
      await adminService.resetPassword(userId, { newPassword });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to reset password',
        loading: false,
      });
      throw error;
    }
  },

  // Account Oversight
  getAllAccounts: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = (await adminService.getAllAccounts(page)) as any;
      console.log('getAllAccounts response:', response);
      set({ accounts: response.accounts || [], loading: false });
    } catch (error: any) {
      console.error('getAllAccounts error:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch accounts',
        loading: false,
      });
    }
  },

  freezeAccount: async (accountId, isFrozen, reason) => {
    set({ loading: true, error: null });
    try {
      await adminService.freezeAccount(accountId, { isFrozen, reason });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to freeze account',
        loading: false,
      });
      throw error;
    }
  },

  closeAccount: async (accountId, reason) => {
    set({ loading: true, error: null });
    try {
      await adminService.closeAccount(accountId, { reason });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to close account',
        loading: false,
      });
      throw error;
    }
  },

  modifyAccountLimits: async (accountId, limits) => {
    set({ loading: true, error: null });
    try {
      await adminService.modifyAccountLimits(accountId, limits);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to modify limits',
        loading: false,
      });
      throw error;
    }
  },

  // Transaction Monitoring
  getAllTransactions: async (page = 1, status) => {
    set({ loading: true, error: null });
    try {
      const response = (await adminService.getAllTransactions(
        page,
        status,
      )) as any;
      console.log('getAllTransactions response:', response);
      set({ transactions: response.transactions || [], loading: false });
    } catch (error: any) {
      console.error('getAllTransactions error:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch transactions',
        loading: false,
      });
    }
  },

  reverseTransaction: async (transactionId, reason) => {
    set({ loading: true, error: null });
    try {
      await adminService.reverseTransaction(transactionId, { reason });
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to reverse transaction',
        loading: false,
      });
      throw error;
    }
  },

  setTransactionLimits: async (limits) => {
    set({ loading: true, error: null });
    try {
      await adminService.setTransactionLimits(limits);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to set limits',
        loading: false,
      });
      throw error;
    }
  },

  setFeeConfiguration: async (fees) => {
    set({ loading: true, error: null });
    try {
      await adminService.setFeeConfiguration(fees);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to set fees',
        loading: false,
      });
      throw error;
    }
  },

  // System Configuration
  getSystemConfig: async () => {
    set({ loading: true, error: null });
    try {
      const response = (await adminService.getSystemConfig()) as any;
      console.log('getSystemConfig response:', response);
      set({
        systemConfig: response.configurations || {},
        loading: false,
      });
    } catch (error: any) {
      console.error('getSystemConfig error:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch config',
        loading: false,
      });
    }
  },

  setInterestRate: async (data) => {
    set({ loading: true, error: null });
    try {
      await adminService.setInterestRate(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to set interest rate',
        loading: false,
      });
      throw error;
    }
  },

  setLoanInterestRate: async (data) => {
    set({ loading: true, error: null });
    try {
      await adminService.setLoanInterestRate(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to set loan rate',
        loading: false,
      });
      throw error;
    }
  },

  setPenaltyRules: async (data) => {
    set({ loading: true, error: null });
    try {
      await adminService.setPenaltyRules(data);
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to set penalty rules',
        loading: false,
      });
      throw error;
    }
  },

  // Security & Audit
  getAuditLogs: async (page = 1, userId, action) => {
    set({ loading: true, error: null });
    try {
      const response = (await adminService.getAuditLogs(
        page,
        userId,
        action,
      )) as any;
      console.log('getAuditLogs response:', response);
      set({ auditLogs: response.logs || [], loading: false });
    } catch (error: any) {
      console.error('getAuditLogs error:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch audit logs',
        loading: false,
      });
    }
  },

  getLoginActivity: async (days = 7) => {
    set({ loading: true, error: null });
    try {
      await adminService.getLoginActivity(days);
      set({ loading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || 'Failed to fetch login activity',
        loading: false,
      });
      throw error;
    }
  },

  getSuspiciousActivity: async () => {
    set({ loading: true, error: null });
    try {
      await adminService.getSuspiciousActivity();
      set({ loading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          'Failed to fetch suspicious activity',
        loading: false,
      });
      throw error;
    }
  },
}));
