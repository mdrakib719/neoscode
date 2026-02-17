import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UserRole } from '@/common/enums';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('monthly-statement')
  getMonthlyStatement(
    @Query('accountId') accountId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlyStatement(+accountId, +year, +month);
  }

  @Get('account-summary')
  getAccountSummary(@GetUser('userId') userId: number) {
    return this.reportsService.getAccountSummary(userId);
  }

  @Get('loan-summary')
  getLoanSummary(@GetUser('userId') userId: number) {
    return this.reportsService.getLoanSummary(userId);
  }

  @Get('system')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getSystemReport() {
    return this.reportsService.getSystemReport();
  }
}
