import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('token_blacklist')
export class TokenBlacklist {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * SHA-256 hash of the JWT token (never store raw token)
   * For user-level bans this is stored as 'user_ban:<userId>'
   */
  @Column({ type: 'varchar', length: 64, unique: true })
  @Index()
  token_hash: string;

  @Column({ nullable: true })
  user_id: number;

  /**
   * 'logout'      → single token blacklisted on logout
   * 'user_ban'    → entire user banned by admin (lock/deactivate)
   */
  @Column({ type: 'varchar', length: 20, default: 'logout' })
  type: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  /**
   * When the blacklist entry itself expires — matches JWT expiry.
   * Entries past this date are safe to delete (cleanup cron).
   */
  @Column({ type: 'datetime' })
  @Index()
  expires_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
