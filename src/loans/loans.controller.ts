import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { ApplyLoanDto, ApproveLoanDto, PayEMIDto } from './dto/loan.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UserRole } from '@/common/enums';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post('apply')
  applyLoan(
    @GetUser('userId') userId: number,
    @Body() applyLoanDto: ApplyLoanDto,
  ) {
    return this.loansService.applyLoan(userId, applyLoanDto);
  }

  @Get()
  getUserLoans(
    @GetUser('userId') userId: number,
    @GetUser('role') role: string,
  ) {
    // Admins and employees can see all loans
    if (role === UserRole.ADMIN || role === UserRole.EMPLOYEE) {
      return this.loansService.getAllLoans();
    }
    // Customers see only their loans
    return this.loansService.getUserLoans(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(+id);
  }

  @Get(':id/repayment-schedule')
  getRepaymentSchedule(@Param('id') id: string) {
    return this.loansService.getRepaymentSchedule(+id);
  }

  @Get(':id/payment-history')
  getPaymentHistory(@Param('id') id: string) {
    return this.loansService.getPaymentHistory(+id);
  }

  @Get(':id/summary')
  getLoanSummary(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.loansService.getLoanSummary(+id, userId);
  }

  @Get(':id/next-emi')
  getNextEMIDetails(
    @Param('id') id: string,
    @GetUser('userId') userId: number,
  ) {
    return this.loansService.getNextEMIDetails(+id, userId);
  }

  @Post(':id/pay-emi')
  payEMI(
    @Param('id') id: string,
    @GetUser('userId') userId: number,
    @Body() payEMIDto: PayEMIDto,
  ) {
    return this.loansService.payEMI(+id, userId, payEMIDto);
  }

  @Put(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  approveLoan(@Param('id') id: string, @Body() approveLoanDto: ApproveLoanDto) {
    return this.loansService.approveLoan(+id, approveLoanDto);
  }

  @Put(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  rejectLoan(@Param('id') id: string, @Body() approveLoanDto: ApproveLoanDto) {
    return this.loansService.rejectLoan(+id, approveLoanDto);
  }
}
