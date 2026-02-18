import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { TokenBlacklist } from '../entities/token-blacklist.entity';

@Injectable()
export class TokenBlacklistService {
  constructor(
    @InjectRepository(TokenBlacklist)
    private blacklistRepository: Repository<TokenBlacklist>,
  ) {}

  // ─── Internal Helper ───────────────────────────────────────────────────────

  /**
   * SHA-256 hash the raw JWT so we never store sensitive token strings.
   */
  private hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  // ─── Token-Level Blacklist (logout) ────────────────────────────────────────

  /**
   * Blacklist a specific token on logout.
   * @param token    Raw JWT string
   * @param userId   Owner of the token
   * @param expiresAt When the JWT itself expires (from decoded payload)
   * @param reason   'logout' | 'admin_revoke' | etc.
   */
  async blacklistToken(
    token: string,
    userId: number,
    expiresAt: Date,
    reason: string = 'logout',
  ): Promise<void> {
    const tokenHash = this.hash(token);

    const existing = await this.blacklistRepository.findOne({
      where: { token_hash: tokenHash },
    });
    if (existing) return; // already blacklisted

    const entry = this.blacklistRepository.create({
      token_hash: tokenHash,
      user_id: userId,
      type: 'logout',
      reason,
      expires_at: expiresAt,
    });
    await this.blacklistRepository.save(entry);
  }

  /**
   * Check if a specific token has been blacklisted (e.g. after logout).
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hash(token);
    const entry = await this.blacklistRepository.findOne({
      where: {
        token_hash: tokenHash,
        expires_at: MoreThan(new Date()),
      },
    });
    return !!entry;
  }

  // ─── User-Level Ban (admin lock / deactivate) ───────────────────────────────

  /**
   * Ban ALL tokens for a user immediately.
   * Called by admin when locking or deactivating an account.
   * Stores a single 'user_ban:<userId>' row — any token belonging
   * to this user is rejected in the JWT strategy.
   */
  async blacklistAllUserTokens(userId: number): Promise<void> {
    const banKey = `user_ban:${userId}`;
    const banHash = this.hash(banKey);

    const existing = await this.blacklistRepository.findOne({
      where: { token_hash: banHash },
    });

    // 30 days — well past any JWT's natural expiry
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (existing) {
      // Refresh expiry if already banned
      existing.expires_at = expiresAt;
      await this.blacklistRepository.save(existing);
    } else {
      const entry = this.blacklistRepository.create({
        token_hash: banHash,
        user_id: userId,
        type: 'user_ban',
        reason: 'account_locked_or_deactivated',
        expires_at: expiresAt,
      });
      await this.blacklistRepository.save(entry);
    }
  }

  /**
   * Check if a user has an active account-level ban.
   */
  async isUserBanned(userId: number): Promise<boolean> {
    const banHash = this.hash(`user_ban:${userId}`);
    const entry = await this.blacklistRepository.findOne({
      where: {
        token_hash: banHash,
        type: 'user_ban',
        expires_at: MoreThan(new Date()),
      },
    });
    return !!entry;
  }

  /**
   * Remove the account-level ban — called when admin unlocks a user.
   * This restores existing sessions immediately.
   */
  async unbanUser(userId: number): Promise<void> {
    const banHash = this.hash(`user_ban:${userId}`);
    await this.blacklistRepository.delete({ token_hash: banHash });
  }

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  /**
   * Remove expired rows every day at midnight.
   * Keeps the table lean — expired entries are no longer useful.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredEntries(): Promise<void> {
    await this.blacklistRepository.delete({
      expires_at: LessThan(new Date()),
    });
    console.log('[TokenBlacklist] Cleaned up expired entries');
  }
}
