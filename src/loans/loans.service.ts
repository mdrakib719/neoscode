import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { LoanPayment } from './entities/loan-payment.entity';
import { Account } from '@/accounts/entities/account.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { User } from '@/users/entities/user.entity';
import { ApplyLoanDto, ApproveLoanDto, PayEMIDto } from './dto/loan.dto';
import {
  LoanStatus,
  TransactionStatus,
  TransactionType,
  AccountType,
} from '@/common/enums';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private loanPaymentRepository: Repository<LoanPayment>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Calculate EMI using the formula:
   * EMI = [P x R x (1+R)^N] / [(1+R)^N – 1]
   * where:
   * P = Principal loan amount
   * R = Monthly interest rate (annual rate / 12 / 100)
   * N = Tenure in months
   */
  private calculateEMI(
    principal: number,
    annualRate: number,
    tenureMonths: number,
  ): number {
    const monthlyRate = annualRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100; // Round to 2 decimal places
  }

  async applyLoan(userId: number, applyLoanDto: ApplyLoanDto): Promise<Loan> {
    // Calculate EMI
    const emiAmount = this.calculateEMI(
      applyLoanDto.amount,
      applyLoanDto.interest_rate,
      applyLoanDto.tenure_months,
    );

    const loan = this.loanRepository.create({
      ...applyLoanDto,
      user_id: userId,
      emi_amount: emiAmount,
      remaining_balance: applyLoanDto.amount,
      paid_installments: 0,
      status: LoanStatus.PENDING,
    });

    return this.loanRepository.save(loan);
  }

  async getUserLoans(userId: number): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async getAllLoans(): Promise<Loan[]> {
    return this.loanRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  async approveLoan(id: number, approveLoanDto: ApproveLoanDto): Promise<Loan> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loan = await queryRunner.manager.findOne(Loan, {
        where: { id },
        relations: ['user'],
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      if (loan.status !== LoanStatus.PENDING) {
        throw new BadRequestException('Loan is not in pending status');
      }

      // Find the user's primary account (SAVINGS or CURRENT)
      // Preferably SAVINGS, fallback to CURRENT, or any active account
      const userAccounts = await queryRunner.manager.find(Account, {
        where: { user_id: loan.user_id },
        order: { created_at: 'ASC' },
      });

      if (!userAccounts || userAccounts.length === 0) {
        throw new BadRequestException(
          'User does not have any account to credit the loan amount',
        );
      }

      // Find best account: SAVINGS > CHECKING > first account
      let targetAccount = userAccounts.find(
        (acc) => acc.account_type === AccountType.SAVINGS,
      );
      if (!targetAccount) {
        targetAccount = userAccounts.find(
          (acc) => acc.account_type === AccountType.CHECKING,
        );
      }
      if (!targetAccount) {
        targetAccount = userAccounts[0];
      }

      // Credit the loan amount to the user's account using direct UPDATE query
      const currentBalance = Number(targetAccount.balance);
      const loanAmount = Number(loan.amount);
      await queryRunner.manager.update(
        Account,
        { id: targetAccount.id },
        { balance: (currentBalance + loanAmount) as any },
      );

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        to_account_id: targetAccount.id,
        amount: Number(loan.amount),
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: `Loan disbursement - ${loan.loan_type} Loan #${loan.id} (${loan.tenure_months} months @ ${loan.interest_rate}% interest)`,
      });
      await queryRunner.manager.save(Transaction, transaction);

      // Update loan status
      loan.status = LoanStatus.APPROVED;
      loan.remaining_balance = Number(loan.amount);
      loan.paid_installments = 0;
      loan.remarks = approveLoanDto.remarks || 'Approved by admin';
      const updatedLoan = await queryRunner.manager.save(Loan, loan);

      await queryRunner.commitTransaction();

      // Notify customer
      if (loan.user) {
        this.notificationsService
          .sendLoanNotification(
            loan.user_id,
            loan.user.email,
            loan.user.name,
            'Approved',
            Number(loan.amount),
            loan.loan_type,
          )
          .catch(() => {});
      }

      return updatedLoan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectLoan(id: number, approveLoanDto: ApproveLoanDto): Promise<Loan> {
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Loan is not in pending status');
    }

    loan.status = LoanStatus.REJECTED;
    loan.remarks = approveLoanDto.remarks || 'Rejected by admin';

    const saved = await this.loanRepository.save(loan);

    // Notify customer
    if (loan.user) {
      this.notificationsService
        .sendLoanNotification(
          loan.user_id,
          loan.user.email,
          loan.user.name,
          'Rejected',
          Number(loan.amount),
          loan.loan_type,
        )
        .catch(() => {});
    }

    return saved;
  }

  async getRepaymentSchedule(loanId: number) {
    const loan = await this.findOne(loanId);

    const schedule = [];
    let remainingPrincipal = loan.amount;
    const monthlyRate = loan.interest_rate / 12 / 100;

    for (let month = 1; month <= loan.tenure_months; month++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = loan.emi_amount - interestPayment;
      remainingPrincipal -= principalPayment;

      schedule.push({
        month,
        emi: loan.emi_amount,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.max(0, Math.round(remainingPrincipal * 100) / 100),
      });
    }

    return {
      loan_id: loan.id,
      total_amount: loan.amount,
      emi_amount: loan.emi_amount,
      tenure_months: loan.tenure_months,
      interest_rate: loan.interest_rate,
      schedule,
    };
  }

  async getNextEMIDetails(loanId: number, userId: number) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId, user_id: userId },
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.status !== LoanStatus.APPROVED) {
      throw new BadRequestException('Loan is not approved');
    }

    if (
      Number(loan.remaining_balance) <= 0 ||
      loan.paid_installments >= loan.tenure_months
    ) {
      return {
        message: 'Loan is fully paid',
        loan_fully_paid: true,
      };
    }

    // Calculate next EMI details
    const monthlyRate = loan.interest_rate / 12 / 100;
    const remainingBalance = Number(loan.remaining_balance);
    const interestAmount =
      Math.round(remainingBalance * monthlyRate * 100) / 100;
    const principalAmount =
      Math.round((Number(loan.emi_amount) - interestAmount) * 100) / 100;

    // Calculate due date for next installment
    const approvalDate = new Date(loan.updated_at); // Use updated_at as approval date
    const nextDueDate = new Date(approvalDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + loan.paid_installments + 1);

    // Calculate penalty if overdue
    const currentDate = new Date();
    let penaltyAmount = 0;
    let daysOverdue = 0;

    if (currentDate > nextDueDate) {
      daysOverdue = Math.floor(
        (currentDate.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysOverdue > 7) {
        // Grace period of 7 days
        const monthsLate = Math.ceil(daysOverdue / 30);
        penaltyAmount =
          Math.round(Number(loan.emi_amount) * 0.02 * monthsLate * 100) / 100;
      }
    }

    const totalAmountDue = Number(loan.emi_amount) + penaltyAmount;

    return {
      loan_id: loan.id,
      installment_number: loan.paid_installments + 1,
      total_installments: loan.tenure_months,
      emi_amount: Number(loan.emi_amount),
      principal_amount: principalAmount,
      interest_amount: interestAmount,
      penalty_amount: penaltyAmount,
      total_amount_due: totalAmountDue,
      due_date: nextDueDate,
      days_overdue: Math.max(0, daysOverdue),
      is_overdue: daysOverdue > 0,
      remaining_balance: remainingBalance,
      loan_fully_paid: false,
    };
  }

  async payEMI(
    loanId: number,
    userId: number,
    payEMIDto: PayEMIDto,
  ): Promise<LoanPayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find loan
      const loan = await queryRunner.manager.findOne(Loan, {
        where: { id: loanId, user_id: userId },
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      if (loan.status !== LoanStatus.APPROVED) {
        throw new BadRequestException('Loan is not approved');
      }

      if (Number(loan.remaining_balance) <= 0) {
        throw new BadRequestException('Loan is already fully paid');
      }

      if (loan.paid_installments >= loan.tenure_months) {
        throw new BadRequestException('All installments are already paid');
      }

      // Find and verify account
      const account = await queryRunner.manager.findOne(Account, {
        where: { id: payEMIDto.account_id, user_id: userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Check if account is frozen
      if (account.isFrozen) {
        throw new BadRequestException(
          'Account is frozen. Cannot process EMI payment. Please contact support.',
        );
      }

      // Calculate payment breakdown
      const monthlyRate = loan.interest_rate / 12 / 100;
      const remainingBalance = Number(loan.remaining_balance);
      const interestAmount =
        Math.round(remainingBalance * monthlyRate * 100) / 100;

      // Calculate due date for this installment
      const approvalDate = new Date(loan.updated_at);
      const dueDate = new Date(approvalDate);
      dueDate.setMonth(dueDate.getMonth() + loan.paid_installments + 1);

      // Calculate penalty for late payment (if any)
      const currentDate = new Date();
      let penaltyAmount = 0;
      if (currentDate > dueDate) {
        const daysLate = Math.floor(
          (currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysLate > 7) {
          // Grace period of 7 days
          const monthsLate = Math.ceil(daysLate / 30);
          penaltyAmount =
            Math.round(Number(loan.emi_amount) * 0.02 * monthsLate * 100) / 100;
        }
      }

      // Determine payment amount (use provided amount or default to EMI + penalty)
      const paymentAmount =
        payEMIDto.amount || Number(loan.emi_amount) + penaltyAmount;

      // Check if account has sufficient balance
      const currentBalance = Number(account.balance);
      if (currentBalance < paymentAmount) {
        throw new BadRequestException(
          `Insufficient balance. Required: $${paymentAmount.toFixed(2)}, Available: $${currentBalance.toFixed(2)}`,
        );
      }

      const principalAmount =
        Math.round((paymentAmount - interestAmount - penaltyAmount) * 100) /
        100;
      const newBalance = Math.max(0, remainingBalance - principalAmount);

      // Deduct from account balance using direct UPDATE query
      await queryRunner.manager.update(
        Account,
        { id: account.id },
        { balance: (currentBalance - paymentAmount) as any },
      );

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        from_account_id: account.id,
        amount: paymentAmount,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.COMPLETED,
        description: `EMI Payment #${loan.paid_installments + 1} - ${loan.loan_type} Loan #${loan.id}${penaltyAmount > 0 ? ` (Penalty: $${penaltyAmount})` : ''}`,
      });
      await queryRunner.manager.save(Transaction, transaction);

      // Create payment record
      const payment = queryRunner.manager.create(LoanPayment, {
        loan_id: loanId,
        installment_number: loan.paid_installments + 1,
        amount_paid: paymentAmount,
        principal_amount: principalAmount,
        interest_amount: interestAmount,
        penalty_amount: penaltyAmount,
        outstanding_balance: newBalance,
        status: TransactionStatus.COMPLETED,
        paid_date: currentDate,
        due_date: dueDate,
        remarks:
          payEMIDto.remarks ||
          `EMI payment #${loan.paid_installments + 1}${penaltyAmount > 0 ? ` (Penalty: $${penaltyAmount})` : ''}`,
      });
      const savedPayment = await queryRunner.manager.save(LoanPayment, payment);

      // Update loan
      loan.remaining_balance = newBalance;
      loan.paid_installments += 1;

      if (newBalance <= 0 || loan.paid_installments >= loan.tenure_months) {
        loan.status = LoanStatus.CLOSED;
      }

      await queryRunner.manager.save(Loan, loan);

      await queryRunner.commitTransaction();

      // Notify customer about EMI payment
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        this.notificationsService
          .sendTransactionNotification(
            userId,
            user.email,
            user.name,
            `EMI Payment #${savedPayment.installment_number}`,
            paymentAmount,
            account.account_number,
          )
          .catch(() => {});
      }

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPaymentHistory(loanId: number): Promise<LoanPayment[]> {
    return this.loanPaymentRepository.find({
      where: { loan_id: loanId },
      order: { installment_number: 'ASC' },
    });
  }

  async getLoanSummary(loanId: number, userId: number) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId, user_id: userId },
      relations: ['user'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    const payments = await this.getPaymentHistory(loanId);

    const totalPaid = payments.reduce(
      (sum, p) => sum + Number(p.amount_paid),
      0,
    );
    const totalPrincipalPaid = payments.reduce(
      (sum, p) => sum + Number(p.principal_amount),
      0,
    );
    const totalInterestPaid = payments.reduce(
      (sum, p) => sum + Number(p.interest_amount),
      0,
    );

    return {
      loan: {
        id: loan.id,
        type: loan.loan_type,
        amount: Number(loan.amount),
        interest_rate: Number(loan.interest_rate),
        tenure_months: loan.tenure_months,
        emi_amount: Number(loan.emi_amount),
        status: loan.status,
      },
      payment_summary: {
        total_amount: Number(loan.amount),
        total_paid: totalPaid,
        total_principal_paid: totalPrincipalPaid,
        total_interest_paid: totalInterestPaid,
        remaining_balance: Number(loan.remaining_balance),
        paid_installments: loan.paid_installments,
        remaining_installments: loan.tenure_months - loan.paid_installments,
      },
      payments,
    };
  }
}
