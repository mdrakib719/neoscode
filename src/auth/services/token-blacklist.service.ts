import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;

  constructor(private jwtService: JwtService) {}

  async onModuleInit() {
    // Create Redis client
    this.redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Handle errors
    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Connect to Redis
    await this.redisClient.connect();
    console.log('Redis connected for token blacklist');
  }

  async onModuleDestroy() {
    // Disconnect Redis client
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  /**
   * Add a token to the blacklist
   * @param token JWT token to blacklist
   * @param userId ID of the user who owns the token
   * @param reason Reason for blacklisting (e.g., 'logout', 'admin_ban')
   */
  async blacklistToken(
    token: string,
    userId: number,
    reason: string,
  ): Promise<void> {
    try {
      // Decode token to get expiration
      const decoded = this.jwtService.decode(token) as any;
      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token or missing expiration');
      }

      // Calculate TTL (time until token expires)
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;

      if (ttl <= 0) {
        // Token already expired, no need to blacklist
        return;
      }

      // Store token in Redis with TTL
      const key = `token_blacklist:${this.hashToken(token)}`;
      const value = JSON.stringify({
        userId,
        reason,
        blacklistedAt: new Date().toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
      });

      await this.redisClient.setEx(key, ttl, value);
    } catch (error) {
      console.error('Error blacklisting token:', error);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token JWT token to check
   * @returns true if blacklisted, false otherwise
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `token_blacklist:${this.hashToken(token)}`;
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      // If Redis is down, deny access for security
      return true;
    }
  }

  /**
   * Blacklist all tokens for a user (used when user is banned)
   * Creates a user-level ban that applies to all their tokens
   * @param userId ID of the user to ban
   */
  async blacklistAllUserTokens(userId: number): Promise<void> {
    try {
      const key = `user_ban:${userId}`;
      const value = JSON.stringify({
        bannedAt: new Date().toISOString(),
        reason: 'account_deactivated',
      });

      // Set with 7 days TTL (tokens typically expire before this)
      const sevenDays = 7 * 24 * 60 * 60;
      await this.redisClient.setEx(key, sevenDays, value);
    } catch (error) {
      console.error('Error blacklisting user tokens:', error);
      throw error;
    }
  }

  /**
   * Check if a user is banned (all their tokens are invalid)
   * @param userId ID of the user to check
   * @returns true if user is banned, false otherwise
   */
  async isUserBanned(userId: number): Promise<boolean> {
    try {
      const key = `user_ban:${userId}`;
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Error checking user ban:', error);
      // If Redis is down, allow access (fail open for user ban, but not for token blacklist)
      return false;
    }
  }

  /**
   * Remove user from ban list (used when account is reactivated)
   * @param userId ID of the user to unban
   */
  async unbanUser(userId: number): Promise<void> {
    try {
      const key = `user_ban:${userId}`;
      await this.redisClient.del(key);
    } catch (error) {
      console.error('Error unbanning user:', error);
      throw error;
    }
  }

  /**
   * Get blacklist information for a token
   * @param token JWT token to check
   * @returns blacklist info or null if not blacklisted
   */
  async getBlacklistInfo(token: string): Promise<any> {
    try {
      const key = `token_blacklist:${this.hashToken(token)}`;
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      console.error('Error getting blacklist info:', error);
      return null;
    }
  }

  /**
   * Hash a token to use as Redis key
   * @param token Token to hash
   * @returns SHA-256 hash of the token
   */
  private hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
