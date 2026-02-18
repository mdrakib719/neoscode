import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, Enable2FADto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() request: any) {
    const token = this.extractTokenFromHeader(request);
    const userId = request.user?.id;
    return this.authService.logout(token, userId);
  }

  // Two-Factor Authentication Endpoints
  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  generate2FA(@GetUser('userId') userId: number) {
    return this.authService.generate2FASecret(userId);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  enable2FA(
    @Body() enable2FADto: Enable2FADto,
    @GetUser('userId') userId: number,
  ) {
    return this.authService.enable2FA(userId, enable2FADto);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  disable2FA(
    @Body('password') password: string,
    @GetUser('userId') userId: number,
  ) {
    return this.authService.disable2FA(userId, password);
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  verify2FA(@Body('token') token: string, @GetUser('userId') userId: number) {
    return this.authService.verify2FA(userId, token);
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
