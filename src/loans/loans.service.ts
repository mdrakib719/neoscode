import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { ApplyLoanDto, ApproveLoanDto } from './dto/loan.dto';
import { LoanStatus } from '@/common/enums';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
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
}
