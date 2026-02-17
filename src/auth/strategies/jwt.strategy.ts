import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private tokenBlacklistService: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true, // gives us the raw request so we can extract the token string
    });
  }

  async validate(req: Request, payload: any) {
    // ── Step 1: Extract the raw token from the Authorization header
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    // ── Step 2: Check if this specific token was blacklisted (e.g. logged out)
    if (token && (await this.tokenBlacklistService.isTokenBlacklisted(token))) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    // ── Step 3: Check if the whole user account is banned by admin
    if (await this.tokenBlacklistService.isUserBanned(payload.userId)) {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact support.',
      );
    }

    // ── Step 4: Fetch fresh user data from DB
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
      select: [
        'id',
        'name',
        'email',
        'role',
        'isActive',
        'isLocked',
        'lock_reason',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // ── Step 5: Check account active status
    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account has been deactivated by admin.',
      );
    }

    // ── Step 6: Check account lock status
    if (user.isLocked) {
      throw new ForbiddenException(
        user.lock_reason || 'Your account has been locked by admin.',
      );
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isLocked: user.isLocked,
    };
  }
}
