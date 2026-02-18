// API Configuration
export const API_BASE_URL = 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',

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

  // Staff (Bank Employees)
  STAFF_CUSTOMERS: '/staff/accounts/customers',
  STAFF_CUSTOMERS_SEARCH: '/staff/accounts/customers/search',
  STAFF_CUSTOMER_DETAILS: (id: number) => `/staff/accounts/customers/${id}`,
  STAFF_CUSTOMER_SUMMARY: (id: number) =>
    `/staff/accounts/customers/${id}/summary`,
  STAFF_CUSTOMER_ACCOUNTS: (id: number) =>
    `/staff/accounts/customers/${id}/all-accounts`,
  STAFF_CUSTOMER_TRANSACTIONS: (id: number) =>
    `/staff/accounts/customers/${id}/transactions`,
  STAFF_ACCOUNT_DETAILS: (id: number) => `/staff/accounts/${id}/details`,
  STAFF_ACCOUNT_LIMITS: (id: number) => `/staff/accounts/${id}/limits`,
  STAFF_ACCOUNT_FREEZE: (id: number) => `/staff/accounts/${id}/freeze`,
  STAFF_ACCOUNT_UNFREEZE: (id: number) => `/staff/accounts/${id}/unfreeze`,
  STAFF_ACCOUNT_TRANSACTIONS: (id: number) =>
    `/staff/accounts/${id}/transactions`,
  STAFF_DEPOSIT: '/staff/accounts/deposit',
  STAFF_WITHDRAW: '/staff/accounts/withdraw',
  STAFF_TRANSFER: '/staff/accounts/transfer',

  // Loan Officers
  LO_LOANS: '/loan-officers/loans',
  LO_LOANS_PENDING: '/loan-officers/loans/pending',
  LO_LOANS_APPROVED: '/loan-officers/loans/approved',
  LO_LOAN_DETAILS: (id: number) => `/loan-officers/loans/${id}`,
  LO_LOAN_REPAYMENT_SCHEDULE: (id: number) =>
    `/loan-officers/loans/${id}/repayment-schedule`,
  LO_LOAN_PAYMENT_HISTORY: (id: number) =>
    `/loan-officers/loans/${id}/payment-history`,
  LO_LOAN_APPROVE: (id: number) => `/loan-officers/loans/${id}/approve`,
  LO_LOAN_REJECT: (id: number) => `/loan-officers/loans/${id}/reject`,
  LO_LOAN_PROCESS_PAYMENT: (id: number) =>
    `/loan-officers/loans/${id}/process-payment`,
  LO_LOAN_REMARKS: (id: number) => `/loan-officers/loans/${id}/remarks`,
  LO_DASHBOARD: '/loan-officers/dashboard/overview',
  LO_OVERDUE: '/loan-officers/dashboard/overdue',
  LO_SEARCH_CUSTOMER: '/loan-officers/search/customer',
};
