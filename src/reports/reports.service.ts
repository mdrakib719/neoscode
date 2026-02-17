import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Account } from '@/accounts/entities/account.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { Loan } from '@/loans/entities/loan.entity';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Generate monthly statement for an account
   */
  async getMonthlyStatement(accountId: number, year: number, month: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get transactions for the period
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where(
        '(transaction.from_account_id = :accountId OR transaction.to_account_id = :accountId)',
        { accountId },
      )
      .andWhere('transaction.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('transaction.created_at', 'ASC')
      .getMany();

    // Calculate totals
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    transactions.forEach((t) => {
      if (t.to_account_id === accountId) {
        totalDeposits += Number(t.amount);
      }
      if (t.from_account_id === accountId) {
        totalWithdrawals += Number(t.amount);
      }
    });

    return {
      account_number: account.account_number,
      account_type: account.account_type,
      account_holder: account.user.name,
      period: {
        year,
        month,
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      summary: {
        opening_balance:
          Number(account.balance) - totalDeposits + totalWithdrawals,
        total_deposits: totalDeposits,
        total_withdrawals: totalWithdrawals,
        closing_balance: Number(account.balance),
      },
      transactions: transactions.map((t) => ({
        date: t.created_at,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        balance: 0, // Can be calculated in a more detailed implementation
      })),
    };
  }

  /**
   * Get account summary
   */
  async getAccountSummary(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const accounts = await this.accountRepository.find({
      where: { user_id: userId },
    });

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0,
    );

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_account', 'from_account')
      .leftJoinAndSelect('transaction.to_account', 'to_account')
      .where('from_account.user_id = :userId', { userId })
      .orWhere('to_account.user_id = :userId', { userId })
      .andWhere('transaction.created_at >= :date', { date: thirtyDaysAgo })
      .orderBy('transaction.created_at', 'DESC')
      .limit(10)
      .getMany();

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      summary: {
        total_accounts: accounts.length,
        total_balance: totalBalance,
        accounts: accounts.map((acc) => ({
          id: acc.id,
          account_number: acc.account_number,
          type: acc.account_type,
          balance: Number(acc.balance),
        })),
      },
      recent_transactions: recentTransactions.map((t) => ({
        id: t.id,
        date: t.created_at,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
      })),
    };
  }

  /**
   * Get loan summary
   */
  async getLoanSummary(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const loans = await this.loanRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    const totalLoanAmount = loans.reduce(
      (sum, loan) => sum + Number(loan.amount),
      0,
    );

    const activeLoan = loans.filter((l) => l.status === 'APPROVED');
    const pendingLoans = loans.filter((l) => l.status === 'PENDING');

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      summary: {
        total_loans: loans.length,
        active_loans: activeLoan.length,
        pending_loans: pendingLoans.length,
        total_loan_amount: totalLoanAmount,
        total_emi: activeLoan.reduce(
          (sum, loan) => sum + Number(loan.emi_amount),
          0,
        ),
      },
      loans: loans.map((loan) => ({
        id: loan.id,
        type: loan.loan_type,
        amount: Number(loan.amount),
        interest_rate: Number(loan.interest_rate),
        tenure_months: loan.tenure_months,
        emi_amount: Number(loan.emi_amount),
        status: loan.status,
        applied_date: loan.created_at,
      })),
    };
  }

  /**
   * Get overall system report (Admin only)
   */
  async getSystemReport() {
    const totalUsers = await this.userRepository.count();
    const totalAccounts = await this.accountRepository.count();
    const totalTransactions = await this.transactionRepository.count();
    const totalLoans = await this.loanRepository.count();

    const accounts = await this.accountRepository.find();
    const totalDeposits = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0,
    );

    const loans = await this.loanRepository.find();
    const totalLoanAmount = loans.reduce(
      (sum, loan) => sum + Number(loan.amount),
      0,
    );

    return {
      system_overview: {
        total_users: totalUsers,
        total_accounts: totalAccounts,
        total_transactions: totalTransactions,
        total_loans: totalLoans,
      },
      financial_summary: {
        total_deposits: totalDeposits,
        total_loan_disbursed: totalLoanAmount,
      },
      generated_at: new Date(),
    };
  }
}
