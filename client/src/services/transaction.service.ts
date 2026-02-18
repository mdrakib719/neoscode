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

  async validateAccount(
    accountNumber: string,
  ): Promise<{
    found: boolean;
    account_number: string;
    account_type: string;
    holder: string;
  }> {
    return apiClient.post(API_ENDPOINTS.VALIDATE_ACCOUNT, { accountNumber });
  },

  async getBeneficiaries(): Promise<any[]> {
    return apiClient.get(API_ENDPOINTS.BENEFICIARIES);
  },

  async addBeneficiary(data: {
    beneficiary_name: string;
    account_number: string;
    bank_name?: string;
    ifsc_code?: string;
    notes?: string;
  }): Promise<any> {
    return apiClient.post(API_ENDPOINTS.BENEFICIARIES, data);
  },

  async deleteBeneficiary(id: number): Promise<void> {
    return apiClient.delete(API_ENDPOINTS.BENEFICIARY(id));
  },
};
