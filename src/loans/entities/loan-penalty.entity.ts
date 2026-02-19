import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { LoanPenaltyStatus } from '@/common/enums';
import { Loan } from './loan.entity';

/**
 * Stores one record per overdue installment.
 * Created automatically by the daily penalty scheduler.
 */
@Entity('loan_penalties')
export class LoanPenalty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loan_id: number;

  /** Which EMI installment this penalty belongs to (1-based) */
  @Column({ type: 'int' })
  installment_number: number;

  /** Scheduled EMI due date */
  @Column({ type: 'date' })
  due_date: Date;

  /** How many days the installment is currently overdue */
  @Column({ type: 'int', default: 0 })
  days_overdue: number;

  /** Original EMI amount that was missed */
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  emi_amount: number;

  /**
   * Penalty calculated for this installment.
   * Method: percentage-based — penalty_rate (% per month) applied daily.
   * penalty = emi_amount * (penalty_rate / 100 / 30) * days_overdue
   */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penalty_amount: number;

  /** Penalty rate snapshot at time of calculation (% per month) */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2 })
  penalty_rate_used: number;

  @Column({
    type: 'enum',
    enum: LoanPenaltyStatus,
    default: LoanPenaltyStatus.PENDING,
  })
  status: LoanPenaltyStatus;

  /** Date the penalty record was first created (first overdue day after grace period) */
  @Column({ type: 'date', nullable: true })
  penalty_start_date: Date;

  /** Date penalty was collected or waived */
  @Column({ type: 'date', nullable: true })
  resolved_date: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @BeforeInsert()
  setCreatedAt() {
    if (!this.updated_at) this.updated_at = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updated_at = new Date();
  }
}
