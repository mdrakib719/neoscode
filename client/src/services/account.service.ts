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
    return apiClient.post<Account>(API_ENDPOINTS.ACCOUNTS, { accountType });
  },
};
