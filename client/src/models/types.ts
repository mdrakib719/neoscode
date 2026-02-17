// Models (Data Types)

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
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
}

export interface Transaction {
  id: number;
  from_account_id?: number;
  to_account_id?: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  created_at: string;
  from_account?: Account;
  to_account?: Account;
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
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
}

export interface LoanApplicationRequest {
  loanType: 'PERSONAL' | 'HOME' | 'VEHICLE' | 'EDUCATION';
  amount: number;
  interestRate: number;
  tenureMonths: number;
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
