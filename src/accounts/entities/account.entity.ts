import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AccountType } from '@/common/enums';
import { User } from '@/users/entities/user.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
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

  @Column()
  user_id: number;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.from_account)
  outgoing_transactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.to_account)
  incoming_transactions: Transaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
