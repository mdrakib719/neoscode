import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import {
  Transaction,
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
} from '../models/types';

export const transactionService = {
  async getHistory(accountId?: number): Promise<Transaction[]> {
    const url = accountId
      ? `${API_ENDPOINTS.TRANSACTIONS}/${accountId}/history`
      : API_ENDPOINTS.TRANSACTIONS;
    return apiClient.get<Transaction[]>(url);
  },

  async deposit(data: DepositRequest): Promise<Transaction> {
    return apiClient.post<Transaction>(API_ENDPOINTS.DEPOSIT, data);
  },

  async withdraw(data: WithdrawRequest): Promise<Transaction> {
    return apiClient.post<Transaction>(API_ENDPOINTS.WITHDRAW, data);
  },

  async transfer(data: TransferRequest): Promise<Transaction> {
    return apiClient.post<Transaction>(API_ENDPOINTS.TRANSFER, data);
  },
};
