import { apiClient } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export const loanOfficerService = {
  // ─── Loan Querying ─────────────────────────────────────────────────────────
  getPendingLoans: (): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.LO_LOANS_PENDING),

  getApprovedLoans: (): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.LO_LOANS_APPROVED),

  getAllLoans: (params?: {
    status?: string;
    loanType?: string;
    customerId?: number;
  }): Promise<any[]> => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.loanType) qs.set('loanType', params.loanType);
    if (params?.customerId) qs.set('customerId', String(params.customerId));
    const query = qs.toString();
    return apiClient.get(
      `${API_ENDPOINTS.LO_LOANS}${query ? `?${query}` : ''}`,
    );
  },

  getLoanDetails: (id: number): Promise<any> =>
    apiClient.get(API_ENDPOINTS.LO_LOAN_DETAILS(id)),

  getRepaymentSchedule: (id: number): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.LO_LOAN_REPAYMENT_SCHEDULE(id)),

  getPaymentHistory: (id: number): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.LO_LOAN_PAYMENT_HISTORY(id)),

  getLoanPenalties: (id: number): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.LO_LOAN_PENALTIES(id)),

  // ─── Loan Decisions ────────────────────────────────────────────────────────
  approveLoan: (
    loanId: number,
    data: { approvalNotes: string; recommendedEMI?: string },
  ): Promise<any> =>
    apiClient.post(API_ENDPOINTS.LO_LOAN_APPROVE(loanId), data),

  rejectLoan: (
    loanId: number,
    data: { rejectionReason: string },
  ): Promise<any> => apiClient.post(API_ENDPOINTS.LO_LOAN_REJECT(loanId), data),

  processPayment: (
    loanId: number,
    data: { accountId: number; amount?: number },
  ): Promise<any> =>
    apiClient.post(API_ENDPOINTS.LO_LOAN_PROCESS_PAYMENT(loanId), data),

  addRemarks: (loanId: number, remarks: string): Promise<any> =>
    apiClient.post(API_ENDPOINTS.LO_LOAN_REMARKS(loanId), { loanId, remarks }),

  // ─── Monitoring Dashboard ──────────────────────────────────────────────────
  getDashboardOverview: (): Promise<any> =>
    apiClient.get(API_ENDPOINTS.LO_DASHBOARD),

  getOverdueLoans: (): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.LO_OVERDUE),

  searchLoansByCustomer: (name: string): Promise<any[]> =>
    apiClient.get(
      `${API_ENDPOINTS.LO_SEARCH_CUSTOMER}?name=${encodeURIComponent(name)}`,
    ),

  // ─── Penalty ────────────────────────────────────────────────────────────────
  runPenaltyCheck: (): Promise<any> =>
    apiClient.post(API_ENDPOINTS.PENALTY_RUN, {}),

  getPenaltySummary: (): Promise<any> =>
    apiClient.get(API_ENDPOINTS.PENALTY_SUMMARY),

  waivePenalty: (penaltyId: number, remarks?: string): Promise<any> =>
    apiClient.post(API_ENDPOINTS.PENALTY_WAIVE(penaltyId), { remarks }),

  collectPenalty: (penaltyId: number): Promise<any> =>
    apiClient.post(API_ENDPOINTS.PENALTY_COLLECT(penaltyId), {}),
};
