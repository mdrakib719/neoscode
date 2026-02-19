import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { User } from '@/users/entities/user.entity';
import { RegisterDto, LoginDto, Enable2FADto } from './dto/auth.dto';
import { TokenBlacklistService } from './services/token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Remove password from response
    delete user.password;

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      if (!loginDto.twoFactorCode) {
        return {
          requires2FA: true,
          message: 'Two-factor authentication code required',
        };
      }

      // Verify 2FA token
      const isValid = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: loginDto.twoFactorCode,
        window: 2,
      });

      if (!isValid) {
        throw new UnauthorizedException(
          'Invalid two-factor authentication code',
        );
      }
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        two_factor_enabled: user.two_factor_enabled,
      },
    };
  }

  async validateUser(userId: number): Promise<User> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  // Two-Factor Authentication Methods
  async generate2FASecret(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.two_factor_enabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled',
      );
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Banking System (${user.email})`,
      length: 32,
    });

    // Save secret to user (but don't enable yet)
    user.two_factor_secret = secret.base32;
    await this.userRepository.save(user);

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message:
        'Scan the QR code with your authenticator app and verify with a code to enable 2FA',
    };
  }

  async enable2FA(userId: number, enable2FADto: Enable2FADto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.two_factor_enabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled',
      );
    }

    if (!user.two_factor_secret) {
      throw new BadRequestException('Please generate 2FA secret first');
    }

    // Verify the token
    const isValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: enable2FADto.token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Enable 2FA
    user.two_factor_enabled = true;
    await this.userRepository.save(user);

    return {
      message: 'Two-factor authentication enabled successfully',
    };
  }

  async disable2FA(userId: number, password: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.two_factor_enabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Disable 2FA
    user.two_factor_enabled = false;
    user.two_factor_secret = null;
    await this.userRepository.save(user);

    return {
      message: 'Two-factor authentication disabled successfully',
    };
  }

  async verify2FA(userId: number, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.two_factor_enabled) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });
  }

  // ==================== LOGOUT & TOKEN MANAGEMENT ====================

  /**
   * Logout user by blacklisting their token
   * @param token - JWT token to blacklist
   * @param userId - ID of the user logging out
   */
  async logout(token: string, userId: number): Promise<{ message: string }> {
    if (token) {
      // Decode to get the expiry so the DB row has the right TTL
      const decoded = this.jwtService.decode(token) as any;
      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // fallback: 24h

      await this.tokenBlacklistService.blacklistToken(
        token,
        userId,
        expiresAt,
        'logout',
      );
    }

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Blacklist all tokens for a user (used when admin bans user)
   * @param userId - User ID to ban
   */
  async blacklistUserTokens(userId: number): Promise<void> {
    await this.tokenBlacklistService.blacklistAllUserTokens(userId);
  }

  /**
   * Check if a token is blacklisted
   * @param token - JWT token to check
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.tokenBlacklistService.isTokenBlacklisted(token);
  }
}
