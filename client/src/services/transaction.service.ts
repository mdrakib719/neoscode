import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import {
  Transaction,
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
  DepositRequestModel,
} from '../models/types';

export const transactionService = {
  async getHistory(accountId?: number): Promise<Transaction[]> {
    const url = accountId
      ? `${API_ENDPOINTS.TRANSACTIONS}/${accountId}/history`
      : API_ENDPOINTS.TRANSACTIONS;
    return apiClient.get<Transaction[]>(url);
  },

  // Create deposit request (users can only request, not directly deposit)
  async createDepositRequest(
    data: DepositRequest,
  ): Promise<DepositRequestModel> {
    return apiClient.post<DepositRequestModel>(
      API_ENDPOINTS.DEPOSIT_REQUESTS,
      data,
    );
  },

  // Get deposit requests
  async getDepositRequests(): Promise<DepositRequestModel[]> {
    return apiClient.get<DepositRequestModel[]>(API_ENDPOINTS.DEPOSIT_REQUESTS);
  },

  // Approve deposit request (admin only)
  async approveDepositRequest(
    id: number,
    remarks?: string,
  ): Promise<DepositRequestModel> {
    return apiClient.put<DepositRequestModel>(
      API_ENDPOINTS.DEPOSIT_REQUEST_APPROVE(id),
      { remarks },
    );
  },

  // Reject deposit request (admin only)
  async rejectDepositRequest(
    id: number,
    remarks: string,
  ): Promise<DepositRequestModel> {
    return apiClient.put<DepositRequestModel>(
      API_ENDPOINTS.DEPOSIT_REQUEST_REJECT(id),
      { remarks },
    );
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
