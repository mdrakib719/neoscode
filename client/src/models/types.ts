// Models (Data Types)

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  two_factor_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  account_number: string;
  account_type:
    | 'SAVINGS'
    | 'CHECKING'
    | 'LOAN'
    | 'FIXED_DEPOSIT'
    | 'RECURRING_DEPOSIT';
  balance: number;
  currency: string;
  user_id: number;
  user?: User;
  created_at: string;
  updated_at: string;
  maturity_date?: string;
  maturity_amount?: number;
  deposit_interest_rate?: number;
  lock_period_months?: number;
  monthly_deposit_amount?: number;
  deposit_start_date?: string;
  status?: string;
  isFrozen?: boolean;
  deleted_at?: string;
  deletion_reason?: string;
}

export interface Transaction {
  id: number;
  from_account_id?: number;
  to_account_id?: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'EXTERNAL_TRANSFER' | 'REVERSAL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  description?: string;
  transfer_type?: 'INTERNAL' | 'EXTERNAL' | null;
  external_bank_name?: string;
  external_account_number?: string;
  external_beneficiary_name?: string;
  external_ifsc_code?: string;
  created_at: string;
  from_account?: Account;
  to_account?: Account;
}

export interface DepositRequestModel {
  id: number;
  user_id: number;
  account_id: number;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  admin_remarks?: string;
  approved_by?: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  account?: Account;
  admin?: User;
}

export interface Loan {
  id: number;
  user_id: number;
  loan_type: 'PERSONAL' | 'HOME' | 'VEHICLE' | 'EDUCATION';
  amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  remaining_balance?: number;
  paid_installments?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  remarks?: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface NextEMIDetails {
  loan_id: number;
  installment_number: number;
  total_installments: number;
  emi_amount: number;
  principal_amount: number;
  interest_amount: number;
  penalty_amount: number;
  total_amount_due: number;
  due_date: string;
  days_overdue: number;
  is_overdue: boolean;
  remaining_balance: number;
  loan_fully_paid: boolean;
  message?: string;
}

export interface Beneficiary {
  id: number;
  user_id: number;
  beneficiary_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DepositRequest {
  accountId: number;
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  accountId: number;
  amount: number;
  description?: string;
}

export interface TransferRequest {
  fromAccountNumber: string;
  toAccountNumber?: string;
  amount: number;
  description?: string;
  isExternal?: boolean;
  externalBankName?: string;
  externalAccountNumber?: string;
  externalBeneficiaryName?: string;
  externalIfscCode?: string;
}

export interface LoanApplicationRequest {
  loan_type: 'PERSONAL' | 'HOME' | 'VEHICLE' | 'EDUCATION';
  amount: number;
  interest_rate: number;
  tenure_months: number;
}

export interface MonthlyStatement {
  accountId: number;
  month: number;
  year: number;
  transactions: Transaction[];
}

export interface AccountSummary {
  account: Account;
  totalCredits: number;
  totalDebits: number;
  transactionCount: number;
}

export interface SystemReport {
  totalUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  totalLoans: number;
  totalDeposits: number;
}

export type NotificationType =
  | 'TRANSACTION'
  | 'LOAN'
  | 'ACCOUNT'
  | 'SECURITY'
  | 'GENERAL';

export type NotificationChannel = 'EMAIL' | 'SMS' | 'IN_APP';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  is_sent: boolean;
  sent_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}
