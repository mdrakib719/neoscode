import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Loan } from '../loans/entities/loan.entity';
import { LoanPayment } from '../loans/entities/loan-payment.entity';
import { LoanPenalty } from '../loans/entities/loan-penalty.entity';
import { LoanStatus, LoanPenaltyStatus } from '@/common/enums';

@Injectable()
export class PenaltySchedulerService {
  private readonly logger = new Logger(PenaltySchedulerService.name);

  constructor(
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private loanPaymentRepository: Repository<LoanPayment>,
    @InjectRepository(LoanPenalty)
    private loanPenaltyRepository: Repository<LoanPenalty>,
  ) {}

  /**
   * Runs every day at 01:00 AM.
   * Scans all APPROVED loans, finds overdue installments (past due_date + grace period),
   * creates/updates LoanPenalty records, and updates loan.total_penalty.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async runDailyPenaltyCheck() {
    this.logger.log('⏰ Running daily penalty check…');
    const result = await this.applyPenalties();
    this.logger.log(
      `✅ Penalty check done — ${result.processed} loans, ${result.penaltiesCreated} new records, ${result.penaltiesUpdated} updated`,
    );
  }

  /**
   * Core penalty logic — can also be triggered manually from the API.
   */
  async applyPenalties(): Promise<{
    processed: number;
    penaltiesCreated: number;
    penaltiesUpdated: number;
    details: any[];
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only check active (APPROVED) loans
    const loans = await this.loanRepository.find({
      where: { status: LoanStatus.APPROVED },
    });

    let penaltiesCreated = 0;
    let penaltiesUpdated = 0;
    const details: any[] = [];

    for (const loan of loans) {
      const loanStart = new Date(loan.created_at);
      loanStart.setHours(0, 0, 0, 0);
      const emiAmount = Number(loan.emi_amount);
      const graceDays = Number(loan.grace_period_days ?? 5);
      const penaltyRate = Number(loan.penalty_rate ?? 2); // % per month

      // Fetch payments already recorded for this loan
      const payments = await this.loanPaymentRepository.find({
        where: { loan_id: loan.id },
      });
      const paidInstallments = new Set(
        payments.map((p) => p.installment_number),
      );

      let loanTotalPenalty = 0;

      for (let i = 1; i <= loan.tenure_months; i++) {
        // Due date = loan start + i months
        const dueDate = new Date(loanStart);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setHours(0, 0, 0, 0);

        // Skip future installments and already-paid ones
        if (dueDate > today) break;
        if (paidInstallments.has(i)) continue;

        // Grace period cutoff
        const graceCutoff = new Date(dueDate);
        graceCutoff.setDate(graceCutoff.getDate() + graceDays);
        if (today <= graceCutoff) continue; // still within grace window

        // Days overdue AFTER grace period
        const daysOverdue = Math.floor(
          (today.getTime() - graceCutoff.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Penalty = EMI * (rate% / 100 / 30) * days_overdue
        const dailyRate = penaltyRate / 100 / 30;
        const penaltyAmount =
          Math.round(emiAmount * dailyRate * daysOverdue * 100) / 100;

        loanTotalPenalty += penaltyAmount;

        // Upsert penalty record (one per loan + installment)
        const existing = await this.loanPenaltyRepository.findOne({
          where: { loan_id: loan.id, installment_number: i },
        });

        if (existing) {
          // Update days_overdue and recalculate penalty if still PENDING
          if (existing.status === LoanPenaltyStatus.PENDING) {
            existing.days_overdue = daysOverdue;
            existing.penalty_amount = penaltyAmount;
            await this.loanPenaltyRepository.save(existing);
            penaltiesUpdated++;
          }
        } else {
          // Create new penalty record
          const penalty = this.loanPenaltyRepository.create({
            loan_id: loan.id,
            installment_number: i,
            due_date: dueDate,
            days_overdue: daysOverdue,
            emi_amount: emiAmount,
            penalty_amount: penaltyAmount,
            penalty_rate_used: penaltyRate,
            penalty_start_date: graceCutoff,
            status: LoanPenaltyStatus.PENDING,
            remarks: `Auto-generated — ${daysOverdue} day(s) overdue after ${graceDays}-day grace period`,
          });
          await this.loanPenaltyRepository.save(penalty);
          penaltiesCreated++;
        }

        details.push({
          loanId: loan.id,
          installment: i,
          dueDate,
          daysOverdue,
          penaltyAmount,
        });
      }

      // Recalculate total_penalty from all PENDING penalties for this loan
      const allPending = await this.loanPenaltyRepository.find({
        where: { loan_id: loan.id, status: LoanPenaltyStatus.PENDING },
      });
      const totalPenalty = allPending.reduce(
        (sum, p) => sum + Number(p.penalty_amount),
        0,
      );

      if (Number(loan.total_penalty) !== totalPenalty) {
        loan.total_penalty = totalPenalty;
        await this.loanRepository.save(loan);
      }
    }

    return {
      processed: loans.length,
      penaltiesCreated,
      penaltiesUpdated,
      details,
    };
  }

  /**
   * Get all penalty records for a specific loan.
   */
  async getLoanPenalties(loanId: number): Promise<LoanPenalty[]> {
    return this.loanPenaltyRepository.find({
      where: { loan_id: loanId },
      order: { installment_number: 'ASC' },
    });
  }

  /**
   * Get summary of all overdue penalties across all loans.
   */
  async getPenaltySummary(): Promise<any> {
    const pending = await this.loanPenaltyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.loan', 'loan')
      .leftJoinAndSelect('loan.user', 'user')
      .where('p.status = :status', { status: LoanPenaltyStatus.PENDING })
      .orderBy('p.days_overdue', 'DESC')
      .getMany();

    const totalPenaltyAmount = pending.reduce(
      (s, p) => s + Number(p.penalty_amount),
      0,
    );

    return {
      totalPendingPenalties: pending.length,
      totalPenaltyAmount: Math.round(totalPenaltyAmount * 100) / 100,
      records: pending,
    };
  }

  /**
   * Waive a penalty (staff/admin action).
   */
  async waivePenalty(
    penaltyId: number,
    remarks?: string,
  ): Promise<LoanPenalty> {
    const penalty = await this.loanPenaltyRepository.findOne({
      where: { id: penaltyId },
    });
    if (!penalty) throw new Error(`Penalty #${penaltyId} not found`);
    penalty.status = LoanPenaltyStatus.WAIVED;
    penalty.resolved_date = new Date();
    penalty.remarks = remarks || 'Waived by staff';

    const saved = await this.loanPenaltyRepository.save(penalty);

    // Recalculate loan total_penalty
    const allPending = await this.loanPenaltyRepository.find({
      where: { loan_id: penalty.loan_id, status: LoanPenaltyStatus.PENDING },
    });
    const totalPenalty = allPending.reduce(
      (sum, p) => sum + Number(p.penalty_amount),
      0,
    );
    await this.loanRepository.update(penalty.loan_id, {
      total_penalty: totalPenalty,
    });

    return saved;
  }

  /**
   * Mark a penalty as collected (when payment includes penalty).
   */
  async collectPenalty(penaltyId: number): Promise<LoanPenalty> {
    const penalty = await this.loanPenaltyRepository.findOne({
      where: { id: penaltyId },
    });
    if (!penalty) throw new Error(`Penalty #${penaltyId} not found`);
    penalty.status = LoanPenaltyStatus.COLLECTED;
    penalty.resolved_date = new Date();
    return this.loanPenaltyRepository.save(penalty);
  }
}
