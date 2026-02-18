import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, Like } from 'typeorm';
import { Loan } from '@/loans/entities/loan.entity';
import { LoanPayment } from '@/loans/entities/loan-payment.entity';
import { LoanPenalty } from '@/loans/entities/loan-penalty.entity';
import { User } from '@/users/entities/user.entity';
import { Account } from '@/accounts/entities/account.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import {
  LoanStatus,
  LoanPenaltyStatus,
  TransactionStatus,
  TransactionType,
  UserRole,
} from '@/common/enums';
import {
  LoanOfficerApproveLoanDto,
  LoanOfficerRejectLoanDto,
  RequestLoanDocumentsDto,
  ProcessLoanPaymentDto,
  UpdateRepaymentScheduleDto,
  LoanFilterDto,
  AddLoanRemarksDto,
} from './dto/loan-officer.dto';

@Injectable()
export class LoanOfficersService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private loanPaymentRepository: Repository<LoanPayment>,
    @InjectRepository(LoanPenalty)
    private loanPenaltyRepository: Repository<LoanPenalty>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get all pending loan applications
   */
  async getPendingLoans(): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { status: LoanStatus.PENDING },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get all approved loans
   */
  async getApprovedLoans(): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { status: LoanStatus.APPROVED },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get all loans (with optional filtering)
   */
  async getAllLoans(filter?: LoanFilterDto): Promise<Loan[]> {
    let query = this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.user', 'user');

    if (filter) {
      if (filter.status) {
        query = query.andWhere('loan.status = :status', {
          status: filter.status,
        });
      }

      if (filter.customerName) {
        query = query.andWhere('user.name LIKE :customerName', {
          customerName: `%${filter.customerName}%`,
        });
      }

      if (filter.loanType) {
        query = query.andWhere('loan.loan_type = :loanType', {
          loanType: filter.loanType,
        });
      }

      if (filter.minAmount !== undefined) {
        query = query.andWhere('loan.amount >= :minAmount', {
          minAmount: filter.minAmount,
        });
      }

      if (filter.maxAmount !== undefined) {
        query = query.andWhere('loan.amount <= :maxAmount', {
          maxAmount: filter.maxAmount,
        });
      }

      if (filter.daysOld !== undefined) {
        const daysAgo = new Date(
          Date.now() - filter.daysOld * 24 * 60 * 60 * 1000,
        );
        query = query.andWhere('loan.created_at >= :daysAgo', { daysAgo });
      }
    }

    return query.orderBy('loan.created_at', 'DESC').getMany();
  }

  /**
   * Get specific loan details
   */
  async getLoanDetails(loanId: number): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    return loan;
  }

  /**
   * Approve a loan application
   */
  async approveLoan(
    approveLoanDto: LoanOfficerApproveLoanDto,
    officerId: number,
  ): Promise<Loan> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const loan = await queryRunner.manager.findOne(Loan, {
        where: { id: approveLoanDto.loanId },
        relations: ['user'],
      });

      if (!loan) {
        throw new NotFoundException('Loan not found');
      }

      if (loan.status !== LoanStatus.PENDING) {
        throw new BadRequestException('Loan is not in pending status');
      }

      // Find the user's primary account
      const userAccounts = await queryRunner.manager.find(Account, {
        where: { user_id: loan.user_id },
      });

      if (!userAccounts || userAccounts.length === 0) {
        throw new BadRequestException(
          'User does not have any account to credit the loan amount',
        );
      }

      const targetAccount = userAccounts[0];

      // Update loan status
      loan.status = LoanStatus.APPROVED;
      loan.remarks = approveLoanDto.approvalNotes;
      await queryRunner.manager.save(loan);

      // Credit the loan amount to the user's account
      const currentBalance = Number(targetAccount.balance);
      const loanAmount = Number(loan.amount);
      targetAccount.balance = currentBalance + loanAmount;
      await queryRunner.manager.save(targetAccount);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        to_account_id: targetAccount.id,
        amount: loanAmount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: `Loan approval: ${approveLoanDto.approvalNotes}`,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return loan;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reject a loan application
   */
  async rejectLoan(
    rejectLoanDto: LoanOfficerRejectLoanDto,
    officerId: number,
  ): Promise<Loan> {
    const loan = await this.getLoanDetails(rejectLoanDto.loanId);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Loan is not in pending status');
    }

    loan.status = LoanStatus.REJECTED;
    loan.remarks = rejectLoanDto.rejectionReason;

    return this.loanRepository.save(loan);
  }

  /**
   * Get repayment schedule for a loan merged with actual payment records
   * from the loan_payments table
   */
  async getRepaymentSchedule(loanId: number): Promise<any[]> {
    const loan = await this.getLoanDetails(loanId);

    // Fetch actual payments from loan_payments table
    const payments = await this.loanPaymentRepository.find({
      where: { loan_id: loanId },
      order: { installment_number: 'ASC' },
    });

    // Map installment_number -> payment record
    const paymentMap = new Map<number, LoanPayment>();
    for (const p of payments) {
      paymentMap.set(p.installment_number, p);
    }

    const schedule = [];
    let remainingBalance = Number(loan.amount);
    const emiAmount = Number(loan.emi_amount);
    const loanStartDate = new Date(loan.created_at);

    for (let i = 1; i <= loan.tenure_months; i++) {
      const dueDate = new Date(loanStartDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const interest =
        remainingBalance * (Number(loan.interest_rate) / 100 / 12);
      const principal = emiAmount - interest;
      remainingBalance -= principal;

      const payment = paymentMap.get(i);
      const isPaid = !!payment;
      const isOverdue = !isPaid && new Date() > dueDate;

      schedule.push({
        installmentNumber: i,
        dueDate,
        emiAmount,
        principal: Math.round(principal * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
        isPaid,
        paidDate: payment?.paid_date || null,
        actualAmountPaid: payment ? Number(payment.amount_paid) : null,
        paymentId: payment?.id || null,
        status: isPaid ? 'PAID' : isOverdue ? 'OVERDUE' : 'PENDING',
      });
    }

    return schedule;
  }

  /**
   * Get payment history for a loan
   */
  async getLoanPaymentHistory(loanId: number): Promise<LoanPayment[]> {
    return this.loanPaymentRepository.find({
      where: { loan_id: loanId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Process a loan payment (EMI)
   */
  async processLoanPayment(
    paymentDto: ProcessLoanPaymentDto,
    officerId: number,
  ): Promise<LoanPayment> {
    const loan = await this.getLoanDetails(paymentDto.loanId);

    if (loan.status !== LoanStatus.APPROVED) {
      throw new BadRequestException('Loan is not approved');
    }

    if (Number(loan.remaining_balance) <= 0) {
      throw new BadRequestException('Loan is already fully paid');
    }

    if (paymentDto.amount !== Number(loan.emi_amount)) {
      throw new BadRequestException(
        `Payment amount must be equal to EMI amount: ${loan.emi_amount}`,
      );
    }

    // Create payment record
    const payment = this.loanPaymentRepository.create({
      loan_id: loan.id,
      installment_number: loan.paid_installments + 1,
      amount_paid: paymentDto.amount,
      principal_amount: paymentDto.amount * 0.9, // Approximation
      interest_amount: paymentDto.amount * 0.1, // Approximation
      outstanding_balance: Number(loan.remaining_balance) - paymentDto.amount,
      status: TransactionStatus.COMPLETED,
      due_date: new Date(),
      paid_date: new Date(),
      remarks:
        paymentDto.notes ||
        `Payment processed by staff: ${paymentDto.reference}`,
    });

    const savedPayment = await this.loanPaymentRepository.save(payment);

    // Update loan
    loan.paid_installments += 1;
    loan.remaining_balance = Number(loan.remaining_balance) - paymentDto.amount;

    if (Number(loan.remaining_balance) <= 0) {
      loan.status = LoanStatus.CLOSED;
    }

    await this.loanRepository.save(loan);

    return savedPayment;
  }

  /**
   * Update repayment schedule
   */
  async updateRepaymentSchedule(
    updateDto: UpdateRepaymentScheduleDto,
  ): Promise<Loan> {
    const loan = await this.getLoanDetails(updateDto.loanId);

    if (loan.status !== LoanStatus.APPROVED) {
      throw new BadRequestException('Can only update approved loans');
    }

    // Recalculate principal based on remaining balance
    loan.tenure_months = updateDto.newTenureMonths;
    loan.emi_amount = updateDto.newEMIAmount;
    loan.remarks = updateDto.reason || loan.remarks;

    return this.loanRepository.save(loan);
  }

  /**
   * Get loan monitoring dashboard
   */
  async getLoanMonitoringDashboard(): Promise<any> {
    const totalLoans = await this.loanRepository.count();
    const pendingLoans = await this.loanRepository.count({
      where: { status: LoanStatus.PENDING },
    });
    const approvedLoans = await this.loanRepository.count({
      where: { status: LoanStatus.APPROVED },
    });
    const rejectedLoans = await this.loanRepository.count({
      where: { status: LoanStatus.REJECTED },
    });
    const closedLoans = await this.loanRepository.count({
      where: { status: LoanStatus.CLOSED },
    });

    // Get total amount lent
    const loanData = await this.loanRepository
      .createQueryBuilder('loan')
      .select('SUM(loan.amount)', 'totalAmount')
      .addSelect('SUM(loan.remaining_balance)', 'totalRemaining')
      .getRawOne();

    return {
      overview: {
        totalLoans,
        pendingLoans,
        approvedLoans,
        rejectedLoans,
        closedLoans,
      },
      financial: {
        totalLent: Number(loanData.totalAmount || 0),
        totalRemaining: Number(loanData.totalRemaining || 0),
        totalPaid:
          Number(loanData.totalAmount || 0) -
          Number(loanData.totalRemaining || 0),
      },
    };
  }

  /**
   * Get overdue loans
   */
  async getOverdueLoans(): Promise<any[]> {
    // Get approved loans with pending EMI
    const loans = await this.loanRepository.find({
      where: { status: LoanStatus.APPROVED },
      relations: ['user'],
    });

    // For each loan, check if there are missed EMI payments
    const overdue = [];

    for (const loan of loans) {
      const schedule = await this.getRepaymentSchedule(loan.id);
      const payments = await this.getLoanPaymentHistory(loan.id);

      for (let i = 0; i < schedule.length; i++) {
        const installment = schedule[i];
        const isPaid = payments.some(
          (p) => p.amount_paid >= installment.emiAmount,
        );

        if (!isPaid && new Date() > installment.dueDate) {
          overdue.push({
            loanId: loan.id,
            customerId: loan.user_id,
            customerName: loan.user.name,
            installmentNumber: installment.installmentNumber,
            dueDate: installment.dueDate,
            amount: installment.emiAmount,
            daysOverdue: Math.floor(
              (Date.now() - installment.dueDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          });
        }
      }
    }

    return overdue;
  }

  /**
   * Add remarks to a loan
   */
  async addLoanRemarks(remarksDto: AddLoanRemarksDto): Promise<Loan> {
    const loan = await this.getLoanDetails(remarksDto.loanId);
    loan.remarks =
      (loan.remarks ? loan.remarks + ' | ' : '') + remarksDto.remarks;
    return this.loanRepository.save(loan);
  }

  /**
   * Get all penalty records for a loan (for display in loan detail panel)
   */
  async getLoanPenalties(loanId: number): Promise<LoanPenalty[]> {
    return this.loanPenaltyRepository.find({
      where: { loan_id: loanId },
      order: { installment_number: 'ASC' },
    });
  }

  /**
   * Search loans by customer
   */
  async searchLoansByCustomer(customerName: string): Promise<Loan[]> {
    return this.loanRepository
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.user', 'user')
      .where('user.name LIKE :customerName', {
        customerName: `%${customerName}%`,
      })
      .orderBy('loan.created_at', 'DESC')
      .getMany();
  }
}
