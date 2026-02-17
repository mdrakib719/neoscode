import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { LoanPayment } from './entities/loan-payment.entity';
import { ApplyLoanDto, ApproveLoanDto, PayEMIDto } from './dto/loan.dto';
import { LoanStatus, TransactionStatus } from '@/common/enums';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private loanPaymentRepository: Repository<LoanPayment>,
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
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Loan is not in pending status');
    }

    loan.status = LoanStatus.APPROVED;
    loan.remaining_balance = Number(loan.amount);
    loan.paid_installments = 0;
    loan.remarks = approveLoanDto.remarks || 'Approved by admin';

    return this.loanRepository.save(loan);
  }

  async rejectLoan(id: number, approveLoanDto: ApproveLoanDto): Promise<Loan> {
    const loan = await this.findOne(id);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException('Loan is not in pending status');
    }

    loan.status = LoanStatus.REJECTED;
    loan.remarks = approveLoanDto.remarks || 'Rejected by admin';

    return this.loanRepository.save(loan);
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

  async payEMI(
    loanId: number,
    userId: number,
    payEMIDto: PayEMIDto,
  ): Promise<LoanPayment> {
    const loan = await this.loanRepository.findOne({
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

    // Calculate payment breakdown
    const monthlyRate = loan.interest_rate / 12 / 100;
    const remainingBalance = Number(loan.remaining_balance);
    const interestAmount =
      Math.round(remainingBalance * monthlyRate * 100) / 100;

    // Calculate penalty for late payment (if any)
    // Assuming EMI is due on the same date each month from approval
    const currentDate = new Date();
    const dayOfMonth = loan.created_at.getDate();
    const expectedPaymentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      dayOfMonth,
    );

    // If we're past the expected date for this installment, charge penalty
    // Penalty: 2% of EMI per month of delay
    let penaltyAmount = 0;
    if (currentDate > expectedPaymentDate) {
      const daysLate = Math.floor(
        (currentDate.getTime() - expectedPaymentDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (daysLate > 7) {
        // Grace period of 7 days
        const monthsLate = Math.ceil(daysLate / 30);
        penaltyAmount =
          Math.round(Number(loan.emi_amount) * 0.02 * monthsLate * 100) / 100;
      }
    }

    const principalAmount =
      Math.round((payEMIDto.amount - interestAmount - penaltyAmount) * 100) /
      100;
    const newBalance = Math.max(0, remainingBalance - principalAmount);

    // Calculate due date for this installment
    const approvalDate = new Date(loan.created_at);
    const dueDate = new Date(approvalDate);
    dueDate.setMonth(dueDate.getMonth() + loan.paid_installments + 1);

    // Create payment record
    const payment = this.loanPaymentRepository.create({
      loan_id: loanId,
      installment_number: loan.paid_installments + 1,
      amount_paid: payEMIDto.amount,
      principal_amount: principalAmount,
      interest_amount: interestAmount,
      penalty_amount: penaltyAmount,
      outstanding_balance: newBalance,
      status: TransactionStatus.COMPLETED,
      paid_date: new Date(),
      due_date: dueDate,
      remarks:
        payEMIDto.remarks ||
        `EMI payment #${loan.paid_installments + 1}${penaltyAmount > 0 ? ` (Penalty: $${penaltyAmount})` : ''}`,
    });

    await this.loanPaymentRepository.save(payment);

    // Update loan
    loan.remaining_balance = newBalance;
    loan.paid_installments += 1;

    if (newBalance <= 0) {
      loan.status = LoanStatus.CLOSED;
    }

    await this.loanRepository.save(loan);

    return payment;
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
