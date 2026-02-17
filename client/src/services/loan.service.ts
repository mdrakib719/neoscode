import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { Loan, LoanApplicationRequest } from '../models/types';

export const loanService = {
  async getAll(): Promise<Loan[]> {
    return apiClient.get<Loan[]>(API_ENDPOINTS.LOANS);
  },

  async getById(id: number): Promise<Loan> {
    return apiClient.get<Loan>(`${API_ENDPOINTS.LOANS}/${id}`);
  },

  async apply(data: LoanApplicationRequest): Promise<Loan> {
    return apiClient.post<Loan>(API_ENDPOINTS.LOAN_APPLY, data);
  },

  async approve(id: number, remarks?: string): Promise<Loan> {
    return apiClient.put<Loan>(API_ENDPOINTS.LOAN_APPROVE(id), { remarks });
  },

  async reject(id: number, remarks: string): Promise<Loan> {
    return apiClient.put<Loan>(API_ENDPOINTS.LOAN_REJECT(id), { remarks });
  },

  async getRepaymentSchedule(id: number): Promise<any[]> {
    return apiClient.get<any[]>(API_ENDPOINTS.LOAN_SCHEDULE(id));
  },

  async getNextEMIDetails(loanId: number): Promise<any> {
    return apiClient.get<any>(API_ENDPOINTS.LOAN_NEXT_EMI(loanId));
  },

  async payEMI(
    loanId: number,
    accountId: number,
    amount?: number,
  ): Promise<any> {
    return apiClient.post<any>(API_ENDPOINTS.LOAN_PAY_EMI(loanId), {
      account_id: accountId,
      amount,
    });
  },
};
