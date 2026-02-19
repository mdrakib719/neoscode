import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Account } from './account.entity';
import { User } from '@/users/entities/user.entity';

@Entity('account_deletion_requests')
export class AccountDeletionRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_id: number;

  @Column()
  user_id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balance_at_request: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ default: 'PENDING' })
  status: string; // PENDING, APPROVED, REJECTED

  @Column({ type: 'text', nullable: true })
  admin_remarks: string;

  @Column({ nullable: true })
  processed_by: number;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'processed_by' })
  processor: User;

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
