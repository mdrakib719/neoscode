import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('user-accounts')
  getUserAccounts(@GetUser('userId') userId: number) {
    return this.reportsService.getUserAccounts(userId);
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

  // PDF Export Endpoints
  @Get('pdf/statement')
  async downloadStatement(
    @Query('accountId') accountId: string,
    @Query('year') year: string,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    return this.reportsService.generatePDFStatement(
      +accountId,
      +year,
      +month,
      res,
    );
  }

  @Get('pdf/loan-summary')
  async downloadLoanSummary(
    @GetUser('userId') userId: number,
    @Res() res: Response,
  ) {
    return this.reportsService.generatePDFLoanSummary(userId, res);
  }

  @Get('pdf/transactions')
  async downloadTransactionReport(
    @GetUser('userId') userId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generatePDFTransactionReport(
      userId,
      start,
      end,
      res,
    );
  }
}
