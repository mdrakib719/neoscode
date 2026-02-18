import axios from 'axios';
import { apiClient } from './api.service';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';

export const reportsService = {
  /** Fetch all accounts owned by the logged-in user (for account picker) */
  getUserAccounts: (): Promise<any[]> =>
    apiClient.get(API_ENDPOINTS.REPORTS_USER_ACCOUNTS),

  /** Fetch monthly statement JSON */
  getMonthlyStatement: (
    accountId: number,
    year: number,
    month: number,
  ): Promise<any> =>
    apiClient.get(
      `${API_ENDPOINTS.REPORTS_MONTHLY}?accountId=${accountId}&year=${year}&month=${month}`,
    ),

  /** Account summary for the logged-in user */
  getAccountSummary: (): Promise<any> =>
    apiClient.get(API_ENDPOINTS.REPORTS_ACCOUNT_SUMMARY),

  /** Loan summary for the logged-in user */
  getLoanSummary: (): Promise<any> =>
    apiClient.get(API_ENDPOINTS.REPORTS_LOAN_SUMMARY),

  /**
   * Download PDF statement as a blob and trigger browser download.
   */
  downloadPDFStatement: async (
    accountId: number,
    year: number,
    month: number,
    filename?: string,
  ): Promise<void> => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${API_ENDPOINTS.REPORTS_PDF_STATEMENT}?accountId=${accountId}&year=${year}&month=${month}`;
    const response = await axios.get(url, {
      responseType: 'blob',
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download =
      filename ??
      `statement-acc${accountId}-${year}-${String(month).padStart(2, '0')}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  },
};
