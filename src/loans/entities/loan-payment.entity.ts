import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Loan } from './loan.entity';
import { TransactionStatus } from '@/common/enums';

@Entity('loan_payments')
export class LoanPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loan_id: number;

  @Column({ type: 'int' })
  installment_number: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount_paid: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  principal_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  interest_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penalty_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  outstanding_balance: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'date', nullable: true })
  paid_date: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
