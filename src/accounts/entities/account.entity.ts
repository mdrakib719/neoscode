import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { AccountType } from '@/common/enums';
import { User } from '@/users/entities/user.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  account_number: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.SAVINGS,
  })
  account_type: AccountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: false })
  isFrozen: boolean;

  @Column({ type: 'timestamp', nullable: true })
  frozen_at: Date;

  @Column({ type: 'text', nullable: true })
  freeze_reason: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'text', nullable: true })
  closeReason: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  dailyWithdrawalLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  dailyTransferLimit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyWithdrawalLimit: number;

  // Fixed Deposit / Recurring Deposit specific fields
  @Column({ type: 'date', nullable: true })
  maturity_date: Date;

  @Column({ type: 'int', nullable: true })
  lock_period_months: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  deposit_interest_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthly_deposit_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maturity_amount: number;

  @Column({ type: 'date', nullable: true })
  deposit_start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'text', nullable: true })
  deletion_reason: string;

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.from_account)
  outgoing_transactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.to_account)
  incoming_transactions: Transaction[];

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
