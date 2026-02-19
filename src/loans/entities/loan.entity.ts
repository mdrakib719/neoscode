import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { LoanType, LoanStatus } from '@/common/enums';
import { User } from '@/users/entities/user.entity';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({
    type: 'enum',
    enum: LoanType,
  })
  loan_type: LoanType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interest_rate: number;

  @Column({ type: 'int' })
  tenure_months: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  emi_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remaining_balance: number;

  @Column({ type: 'int', default: 0 })
  paid_installments: number;

  /** Grace period in days before penalty kicks in (default 5 days) */
  @Column({ type: 'int', default: 5 })
  grace_period_days: number;

  /**
   * Penalty rate as % per month, applied daily.
   * Daily rate = penalty_rate / 30
   * Default: 2% per month
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  penalty_rate: number;

  /** Running total of all accrued penalties on this loan */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_penalty: number;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => User, (user) => user.loans)
  @JoinColumn({ name: 'user_id' })
  user: User;

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
