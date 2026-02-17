import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { InterestService } from './interest.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@Controller('interest')
@UseGuards(JwtAuthGuard)
export class InterestController {
  constructor(private interestService: InterestService) {}

  @Post('apply')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  applyInterest() {
    return this.interestService.applyInterestManually();
  }

  @Get('summary/:accountId')
  getInterestSummary(@Param('accountId') accountId: string) {
    return this.interestService.getInterestSummary(+accountId);
  }
}
