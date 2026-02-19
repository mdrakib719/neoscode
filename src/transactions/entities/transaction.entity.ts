import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionType, TransactionStatus } from '@/common/enums';
import { Account } from '@/accounts/entities/account.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  from_account_id: number;

  @Column({ nullable: true })
  to_account_id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  // External transfer fields
  @Column({ type: 'varchar', length: 20, nullable: true })
  transfer_type: 'INTERNAL' | 'EXTERNAL' | null;

  @Column({ nullable: true })
  external_bank_name: string;

  @Column({ nullable: true })
  external_account_number: string;

  @Column({ nullable: true })
  external_beneficiary_name: string;

  @Column({ nullable: true })
  external_ifsc_code: string;

  @ManyToOne(() => Account, (account) => account.outgoing_transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'from_account_id' })
  from_account: Account;

  @ManyToOne(() => Account, (account) => account.incoming_transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'to_account_id' })
  to_account: Account;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
