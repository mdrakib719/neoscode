import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import PDFDocumentType from 'pdfkit';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument: typeof PDFDocumentType = require('pdfkit');
import { Response } from 'express';
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
   * Returns running balance per transaction row
   */
  async getMonthlyStatement(accountId: number, year: number, month: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Start / end of requested month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // All transactions that involve this account, ordered oldest-first
    const transactions = await this.transactionRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.from_account', 'from_account')
      .leftJoinAndSelect('t.to_account', 'to_account')
      .where('(t.from_account_id = :aid OR t.to_account_id = :aid)', {
        aid: accountId,
      })
      .andWhere('t.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('t.created_at', 'ASC')
      .getMany();

    // ── calculate totals ──────────────────────────────────────
    let totalCredits = 0;
    let totalDebits = 0;

    transactions.forEach((t) => {
      const amt = Number(t.amount);
      if (t.to_account_id === accountId) totalCredits += amt;
      if (t.from_account_id === accountId) totalDebits += amt;
    });

    // Opening balance = current balance reversed from the month's activity
    const openingBalance = Number(account.balance) - totalCredits + totalDebits;

    // ── build rows with running balance ───────────────────────
    let runningBalance = openingBalance;
    const rows = transactions.map((t) => {
      const amt = Number(t.amount);
      const isCredit = t.to_account_id === accountId;
      const credit = isCredit ? amt : 0;
      const debit = !isCredit ? amt : 0;
      runningBalance += credit - debit;

      return {
        id: t.id,
        date: t.created_at,
        type: t.type,
        direction: isCredit ? 'CREDIT' : 'DEBIT',
        description: t.description || `${t.type}`,
        debit: debit > 0 ? debit : null,
        credit: credit > 0 ? credit : null,
        balance: Math.round(runningBalance * 100) / 100,
        status: t.status,
        counterpart: isCredit
          ? (t.from_account?.account_number ?? null)
          : (t.to_account?.account_number ?? null),
      };
    });

    return {
      account: {
        id: account.id,
        account_number: account.account_number,
        account_type: account.account_type,
        holder: account.user?.name ?? 'Unknown',
        email: account.user?.email ?? '',
        current_balance: Number(account.balance),
      },
      period: {
        year,
        month,
        month_name: new Date(year, month - 1, 1).toLocaleString('en-US', {
          month: 'long',
        }),
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      },
      summary: {
        opening_balance: Math.round(openingBalance * 100) / 100,
        total_credits: Math.round(totalCredits * 100) / 100,
        total_debits: Math.round(totalDebits * 100) / 100,
        closing_balance: Number(account.balance),
        transaction_count: transactions.length,
      },
      transactions: rows,
    };
  }

  /**
   * Get all accounts for a user (to let them pick in the UI)
   */
  async getUserAccounts(userId: number) {
    return this.accountRepository.find({
      where: { user_id: userId },
      order: { created_at: 'ASC' },
    });
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

  /**
   * Generate PDF Statement
   */
  async generatePDFStatement(
    accountId: number,
    year: number,
    month: number,
    res: Response,
  ): Promise<void> {
    const statement = await this.getMonthlyStatement(accountId, year, month);

    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=statement-${statement.account.account_number}-${year}-${month}.pdf`,
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Banking System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Monthly Account Statement', { align: 'center' });
    doc.moveDown();

    // Account details
    doc.fontSize(12);
    doc.text(`Account Number: ${statement.account.account_number}`);
    doc.text(`Account Type: ${statement.account.account_type}`);
    doc.text(`Account Holder: ${statement.account.holder}`);
    doc.text(`Period: ${statement.period.from} to ${statement.period.to}`);
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(
      `Opening Balance: $${Number(statement.summary.opening_balance).toFixed(2)}`,
    );
    doc.text(
      `Total Credits: $${Number(statement.summary.total_credits).toFixed(2)}`,
    );
    doc.text(
      `Total Debits: $${Number(statement.summary.total_debits).toFixed(2)}`,
    );
    doc.text(
      `Closing Balance: $${Number(statement.summary.closing_balance).toFixed(2)}`,
    );
    doc.moveDown();

    // Transactions
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.fontSize(10);

    if (statement.transactions.length === 0) {
      doc.text('No transactions for this period.');
    } else {
      statement.transactions.forEach((t) => {
        const date = new Date(t.date).toLocaleDateString();
        const amount =
          t.credit > 0
            ? `+$${Number(t.credit).toFixed(2)}`
            : `-$${Number(t.debit).toFixed(2)}`;
        doc.text(
          `${date} | ${t.type} | ${amount} | Bal: $${Number(t.balance).toFixed(2)} | ${t.description || ''}`,
        );
      });
    }

    doc.moveDown();
    doc.fontSize(8).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });

    // Finalize the PDF
    doc.end();
  }

  /**
   * Generate PDF Loan Summary
   */
  async generatePDFLoanSummary(userId: number, res: Response): Promise<void> {
    const loanSummary = await this.getLoanSummary(userId);

    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=loan-summary-${userId}.pdf`,
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Banking System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Loan Summary Report', { align: 'center' });
    doc.moveDown();

    // User details
    doc.fontSize(12);
    doc.text(`Name: ${loanSummary.user.name}`);
    doc.text(`Email: ${loanSummary.user.email}`);
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Loans: ${loanSummary.summary.total_loans}`);
    doc.text(`Active Loans: ${loanSummary.summary.active_loans}`);
    doc.text(`Pending Loans: ${loanSummary.summary.pending_loans}`);
    doc.text(
      `Total Loan Amount: $${loanSummary.summary.total_loan_amount.toFixed(2)}`,
    );
    doc.text(`Total EMI: $${loanSummary.summary.total_emi.toFixed(2)}`);
    doc.moveDown();

    // Loan Details
    doc.fontSize(14).text('Loan Details', { underline: true });
    doc.fontSize(10);

    if (loanSummary.loans.length === 0) {
      doc.text('No loans found.');
    } else {
      loanSummary.loans.forEach((loan) => {
        doc.text(`\nLoan ID: ${loan.id}`);
        doc.text(`Type: ${loan.type}`);
        doc.text(`Amount: $${loan.amount.toFixed(2)}`);
        doc.text(`Interest Rate: ${loan.interest_rate}%`);
        doc.text(`Tenure: ${loan.tenure_months} months`);
        doc.text(`EMI: $${loan.emi_amount.toFixed(2)}`);
        doc.text(`Status: ${loan.status}`);
        doc.text(
          `Applied Date: ${new Date(loan.applied_date).toLocaleDateString()}`,
        );
      });
    }

    doc.moveDown();
    doc.fontSize(8).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });

    // Finalize the PDF
    doc.end();
  }

  /**
   * Generate PDF Transaction Report
   */
  async generatePDFTransactionReport(
    userId: number,
    startDate: Date,
    endDate: Date,
    res: Response,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_account', 'from_account')
      .leftJoinAndSelect('transaction.to_account', 'to_account')
      .where('from_account.user_id = :userId', { userId })
      .orWhere('to_account.user_id = :userId', { userId })
      .andWhere('transaction.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('transaction.created_at', 'DESC')
      .getMany();

    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transaction-report-${userId}.pdf`,
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('Banking System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Transaction Report', { align: 'center' });
    doc.moveDown();

    // User details
    doc.fontSize(12);
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(
      `Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    );
    doc.moveDown();

    // Transactions
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.fontSize(10);

    if (transactions.length === 0) {
      doc.text('No transactions for this period.');
    } else {
      let totalDebit = 0;
      let totalCredit = 0;

      transactions.forEach((t) => {
        const date = new Date(t.created_at).toLocaleDateString();
        const amount = Number(t.amount);

        if (t.from_account?.user_id === userId) {
          totalDebit += amount;
        }
        if (t.to_account?.user_id === userId) {
          totalCredit += amount;
        }

        doc.text(
          `${date} | ${t.type} | $${amount.toFixed(2)} | ${t.status} | ${t.description || 'N/A'}`,
        );
      });

      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Credit: $${totalCredit.toFixed(2)}`);
      doc.text(`Total Debit: $${totalDebit.toFixed(2)}`);
      doc.text(`Net: $${(totalCredit - totalDebit).toFixed(2)}`);
    }

    doc.moveDown();
    doc.fontSize(8).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });

    // Finalize the PDF
    doc.end();
  }
}
