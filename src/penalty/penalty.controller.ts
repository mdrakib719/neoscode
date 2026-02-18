import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PenaltySchedulerService } from './penalty.scheduler.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { IsOptional, IsString } from 'class-validator';

class WaivePenaltyDto {
  @IsOptional()
  @IsString()
  remarks?: string;
}

@Controller('penalty')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
export class PenaltyController {
  constructor(private penaltyService: PenaltySchedulerService) {}

  /**
   * Manually trigger the penalty check (admin/staff action).
   * Same as the daily cron — useful for testing or on-demand runs.
   */
  @Post('run')
  triggerPenaltyCheck() {
    return this.penaltyService.applyPenalties();
  }

  /**
   * Get penalty summary across all loans.
   */
  @Get('summary')
  getSummary() {
    return this.penaltyService.getPenaltySummary();
  }

  /**
   * Get all penalty records for a specific loan.
   */
  @Get('loan/:loanId')
  getLoanPenalties(@Param('loanId') loanId: string) {
    return this.penaltyService.getLoanPenalties(+loanId);
  }

  /**
   * Waive a specific penalty record.
   */
  @Post(':penaltyId/waive')
  waivePenalty(
    @Param('penaltyId') penaltyId: string,
    @Body() body: WaivePenaltyDto,
  ) {
    return this.penaltyService.waivePenalty(+penaltyId, body.remarks);
  }

  /**
   * Mark penalty as collected.
   */
  @Post(':penaltyId/collect')
  collectPenalty(@Param('penaltyId') penaltyId: string) {
    return this.penaltyService.collectPenalty(+penaltyId);
  }
}
