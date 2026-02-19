// API Configuration - uses VITE_API_URL env variable for production, falls back to localhost for dev
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://banking-backend-u99s.onrender.com/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  // 2FA
  TWO_FA_GENERATE: '/auth/2fa/generate',
  TWO_FA_ENABLE: '/auth/2fa/enable',
  TWO_FA_DISABLE: '/auth/2fa/disable',
  TWO_FA_VERIFY: '/auth/2fa/verify',

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
  VALIDATE_ACCOUNT: '/transactions/validate-account',
  BENEFICIARIES: '/transactions/beneficiaries',
  BENEFICIARY: (id: number) => `/transactions/beneficiaries/${id}`,

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
  REPORTS_USER_ACCOUNTS: '/reports/user-accounts',
  REPORTS_ACCOUNT_SUMMARY: '/reports/account-summary',
  REPORTS_LOAN_SUMMARY: '/reports/loan-summary',
  REPORTS_SYSTEM: '/reports/system-report',
  REPORTS_PDF_STATEMENT: '/reports/pdf/statement',
  REPORTS_PDF_LOAN: '/reports/pdf/loan-summary',

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
  LO_LOAN_PENALTIES: (id: number) => `/loan-officers/loans/${id}/penalties`,
  LO_LOAN_APPROVE: (id: number) => `/loan-officers/loans/${id}/approve`,
  LO_LOAN_REJECT: (id: number) => `/loan-officers/loans/${id}/reject`,
  LO_LOAN_PROCESS_PAYMENT: (id: number) =>
    `/loan-officers/loans/${id}/process-payment`,
  LO_LOAN_REMARKS: (id: number) => `/loan-officers/loans/${id}/remarks`,
  LO_DASHBOARD: '/loan-officers/dashboard/overview',
  LO_OVERDUE: '/loan-officers/dashboard/overdue',
  LO_SEARCH_CUSTOMER: '/loan-officers/search/customer',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
  NOTIFICATION_MARK_READ: (id: number) => `/notifications/${id}/read`,
  NOTIFICATIONS_MARK_ALL_READ: '/notifications/read-all',
  NOTIFICATION_DELETE: (id: number) => `/notifications/${id}`,

  // Penalty
  PENALTY_RUN: '/penalty/run',
  PENALTY_SUMMARY: '/penalty/summary',
  PENALTY_LOAN: (loanId: number) => `/penalty/loan/${loanId}`,
  PENALTY_WAIVE: (id: number) => `/penalty/${id}/waive`,
  PENALTY_COLLECT: (id: number) => `/penalty/${id}/collect`,
};
