import { apiClient as api } from './api.service';

export const adminService = {
  // User Management
  getAllUsers: () => api.get('/users'),

  createEmployee: (data: { name: string; email: string; password: string }) =>
    api.post('/admin/users/employees', data),

  activateUser: (
    userId: number,
    data: { isActive: boolean; reason?: string },
  ) => api.put(`/admin/users/${userId}/activation`, data),

  lockUser: (userId: number, data: { isLocked: boolean; reason?: string }) =>
    api.put(`/admin/users/${userId}/lock`, data),

  unlockUser: (userId: number, data: { reason?: string }) =>
    api.put(`/admin/users/${userId}/unlock`, data),

  assignRole: (userId: number, data: { role: string }) =>
    api.put(`/admin/users/${userId}/role`, data),

  resetPassword: (userId: number, data: { newPassword: string }) =>
    api.post(`/admin/users/${userId}/reset-password`, data),

  // Account Oversight
  getAllAccounts: (page: number = 1, limit: number = 50) =>
    api.get(`/admin/accounts?page=${page}&limit=${limit}`),

  freezeAccount: (
    accountId: number,
    data: { isFrozen: boolean; reason?: string },
  ) => api.put(`/admin/accounts/${accountId}/freeze`, data),

  closeAccount: (accountId: number, data: { reason: string }) =>
    api.post(`/admin/accounts/${accountId}/close`, data),

  modifyAccountLimits: (
    accountId: number,
    data: {
      dailyWithdrawalLimit?: number;
      dailyTransferLimit?: number;
      monthlyWithdrawalLimit?: number;
    },
  ) => api.put(`/admin/accounts/${accountId}/limits`, data),

  // Transaction Monitoring
  getAllTransactions: (page: number = 1, status?: string) => {
    let url = `/admin/transactions?page=${page}&limit=100`;
    if (status) url += `&status=${status}`;
    return api.get(url);
  },

  reverseTransaction: (transactionId: number, data: { reason: string }) =>
    api.post(`/admin/transactions/${transactionId}/reverse`, data),

  setTransactionLimits: (data: {
    dailyTransferLimit: number;
    dailyWithdrawalLimit: number;
    perTransactionLimit?: number;
  }) => api.put('/admin/settings/transaction-limits', data),

  setFeeConfiguration: (data: {
    transferFee: number;
    withdrawalFee: number;
    monthlyMaintenanceFee?: number;
  }) => api.put('/admin/settings/fees', data),

  // Loan Management
  setInterestRate: (data: { accountType: string; interestRate: number }) =>
    api.put('/admin/settings/interest-rate', data),

  setLoanInterestRate: (data: { loanType: string; interestRate: number }) =>
    api.put('/admin/settings/loan-interest-rate', data),

  setPenaltyRules: (data: {
    lateFeePercentage: number;
    overdraftFee: number;
    minimumBalanceFee?: number;
  }) => api.put('/admin/settings/penalty-rules', data),

  // System Configuration
  getSystemConfig: () => api.get('/admin/settings/config'),

  setCurrency: (data: { currency: string; exchangeRate?: number }) =>
    api.put('/admin/settings/currency', data),

  // Security & Audit
  getAuditLogs: (page: number = 1, userId?: number, action?: string) => {
    let url = `/admin/audit/logs?page=${page}&limit=50`;
    if (userId) url += `&userId=${userId}`;
    if (action) url += `&action=${action}`;
    return api.get(url);
  },

  getLoginActivity: (days: number = 7) =>
    api.get(`/admin/security/login-activity?days=${days}`),

  getSuspiciousActivity: () => api.get('/admin/security/suspicious-activity'),
};
