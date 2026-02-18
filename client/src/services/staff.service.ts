import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const staffService = {
  // ─── Customer Management ───────────────────────────────────────────────────
  getAllCustomers: (): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.STAFF_CUSTOMERS),

  searchCustomers: (q: string): Promise<any[]> =>
    apiClient.get(
      `${API_ENDPOINTS.STAFF_CUSTOMERS_SEARCH}?q=${encodeURIComponent(q)}`,
    ),

  getCustomerDetails: (id: number): Promise<any> =>
    apiClient.get(API_ENDPOINTS.STAFF_CUSTOMER_DETAILS(id)),

  getCustomerSummary: (id: number): Promise<any> =>
    apiClient.get(API_ENDPOINTS.STAFF_CUSTOMER_SUMMARY(id)),

  getCustomerAccounts: (id: number): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.STAFF_CUSTOMER_ACCOUNTS(id)),

  getCustomerTransactions: (id: number, limit = 50): Promise<any[]> =>
    apiClient.get(
      `${API_ENDPOINTS.STAFF_CUSTOMER_TRANSACTIONS(id)}?limit=${limit}`,
    ),

  // ─── Account Management ────────────────────────────────────────────────────
  getAccountDetails: (accountId: number): Promise<any> =>
    apiClient.get(API_ENDPOINTS.STAFF_ACCOUNT_DETAILS(accountId)),

  getAccountTransactions: (accountId: number, limit = 50): Promise<any[]> =>
    apiClient.get(
      `${API_ENDPOINTS.STAFF_ACCOUNT_TRANSACTIONS(accountId)}?limit=${limit}`,
    ),

  updateAccountLimits: (
    accountId: number,
    limits: {
      dailyWithdrawalLimit?: number;
      dailyTransferLimit?: number;
      monthlyWithdrawalLimit?: number;
    },
  ): Promise<any> =>
    apiClient.put(API_ENDPOINTS.STAFF_ACCOUNT_LIMITS(accountId), {
      accountId,
      ...limits,
    }),

  freezeAccount: (accountId: number, reason: string): Promise<any> =>
    apiClient.put(API_ENDPOINTS.STAFF_ACCOUNT_FREEZE(accountId), {
      isFrozen: true,
      reason,
    }),

  unfreezeAccount: (accountId: number): Promise<any> =>
    apiClient.put(API_ENDPOINTS.STAFF_ACCOUNT_FREEZE(accountId), {
      isFrozen: false,
    }),

  // ─── Transaction Handling ──────────────────────────────────────────────────
  performDeposit: (data: {
    customerId: number;
    amount: number;
    reference?: string;
    notes?: string;
  }): Promise<any> =>
    apiClient.post(API_ENDPOINTS.STAFF_DEPOSIT, {
      customerId: data.customerId,
      amount: data.amount,
      reference: data.reference || `DEP-${Date.now()}`,
      notes: data.notes,
    }),

  performWithdrawal: (data: {
    customerId: number;
    amount: number;
    reference?: string;
    notes?: string;
  }): Promise<any> =>
    apiClient.post(API_ENDPOINTS.STAFF_WITHDRAW, {
      customerId: data.customerId,
      amount: data.amount,
      reference: data.reference || `WDR-${Date.now()}`,
      notes: data.notes,
    }),

  performTransfer: (data: {
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    reference?: string;
    notes?: string;
  }): Promise<any> =>
    apiClient.post(API_ENDPOINTS.STAFF_TRANSFER, {
      fromAccountId: data.fromAccountId,
      toAccountId: data.toAccountId,
      amount: data.amount,
      reference: data.reference || `TRF-${Date.now()}`,
      notes: data.notes,
    }),
};
