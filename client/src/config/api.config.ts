// API Configuration
export const API_BASE_URL = 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',

  // Users
  PROFILE: '/users/profile',
  USERS: '/users',

  // Accounts
  ACCOUNTS: '/accounts',
  ACCOUNTS_FIXED_DEPOSIT: '/accounts/fixed-deposit',
  ACCOUNTS_RECURRING_DEPOSIT: '/accounts/recurring-deposit',

  // Transactions
  TRANSACTIONS: '/transactions',
  DEPOSIT: '/transactions/deposit',
  DEPOSIT_REQUESTS: '/transactions/deposit-requests',
  DEPOSIT_REQUEST_APPROVE: (id: number) =>
    `/transactions/deposit-requests/${id}/approve`,
  DEPOSIT_REQUEST_REJECT: (id: number) =>
    `/transactions/deposit-requests/${id}/reject`,
  WITHDRAW: '/transactions/withdraw',
  TRANSFER: '/transactions/transfer',

  // Loans
  LOANS: '/loans',
  LOAN_APPLY: '/loans/apply',
  LOAN_APPROVE: (id: number) => `/loans/${id}/approve`,
  LOAN_REJECT: (id: number) => `/loans/${id}/reject`,
  LOAN_SCHEDULE: (id: number) => `/loans/${id}/repayment-schedule`,
  LOAN_NEXT_EMI: (id: number) => `/loans/${id}/next-emi`,
  LOAN_PAY_EMI: (id: number) => `/loans/${id}/pay-emi`,

  // Reports
  REPORTS_MONTHLY: '/reports/monthly-statement',
  REPORTS_ACCOUNT_SUMMARY: '/reports/account-summary',
  REPORTS_LOAN_SUMMARY: '/reports/loan-summary',
  REPORTS_SYSTEM: '/reports/system-report',

  // Interest
  INTEREST_APPLY: '/interest/apply',
  INTEREST_SUMMARY: '/interest/summary',
};
