import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Account } from '../models/types';

export const accountService = {
  async getAll(): Promise<Account[]> {
    return apiClient.get<Account[]>(API_ENDPOINTS.ACCOUNTS);
  },

  async getById(id: number): Promise<Account> {
    return apiClient.get<Account>(`${API_ENDPOINTS.ACCOUNTS}/${id}`);
  },

  async create(accountType: 'SAVINGS' | 'CHECKING'): Promise<Account> {
    return apiClient.post<Account>(API_ENDPOINTS.ACCOUNTS, {
      account_type: accountType,
    });
  },

  async createFixedDeposit(
    amount: number,
    lockPeriodMonths: number,
    interestRate?: number,
  ): Promise<Account> {
    return apiClient.post<Account>(API_ENDPOINTS.ACCOUNTS_FIXED_DEPOSIT, {
      amount,
      lock_period_months: lockPeriodMonths,
      interest_rate: interestRate,
    });
  },

  async createRecurringDeposit(
    monthlyAmount: number,
    lockPeriodMonths: number,
    interestRate?: number,
  ): Promise<Account> {
    return apiClient.post<Account>(API_ENDPOINTS.ACCOUNTS_RECURRING_DEPOSIT, {
      monthly_amount: monthlyAmount,
      lock_period_months: lockPeriodMonths,
      interest_rate: interestRate,
    });
  },
};
