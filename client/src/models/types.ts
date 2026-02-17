// Models (Data Types)

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'LOAN';
  balance: number;
  currency: string;
  userId: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  fromAccountId?: number;
  toAccountId?: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  createdAt: string;
  fromAccount?: Account;
  toAccount?: Account;
}

export interface Loan {
  id: number;
  userId: number;
  loanType: 'PERSONAL' | 'HOME' | 'VEHICLE' | 'EDUCATION';
  amount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  remarks?: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
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
