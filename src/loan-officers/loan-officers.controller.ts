import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoanOfficersService } from './loan-officers.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UserRole } from '@/common/enums';
import {
  LoanOfficerApproveLoanDto,
  LoanOfficerRejectLoanDto,
  RequestLoanDocumentsDto,
  ProcessLoanPaymentDto,
  UpdateRepaymentScheduleDto,
  LoanFilterDto,
  AddLoanRemarksDto,
} from './dto/loan-officer.dto';

@Controller('loan-officers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
export class LoanOfficersController {
  constructor(private loanOfficersService: LoanOfficersService) {}

  /**
   * Get pending loan applications for review
   */
  @Get('loans/pending')
  getPendingLoans() {
    return this.loanOfficersService.getPendingLoans();
  }

  /**
   * Get approved loans
   */
  @Get('loans/approved')
  getApprovedLoans() {
    return this.loanOfficersService.getApprovedLoans();
  }

  /**
   * Get all loans with optional filtering
   */
  @Get('loans')
  getAllLoans(@Query() filter: LoanFilterDto) {
    return this.loanOfficersService.getAllLoans(filter);
  }

  /**
   * Get specific loan details
   */
  @Get('loans/:loanId')
  getLoanDetails(@Param('loanId') loanId: string) {
    return this.loanOfficersService.getLoanDetails(+loanId);
  }

  /**
   * Get repayment schedule for a loan
   */
  @Get('loans/:loanId/repayment-schedule')
  getRepaymentSchedule(@Param('loanId') loanId: string) {
    return this.loanOfficersService.getRepaymentSchedule(+loanId);
  }

  /**
   * Get payment history for a loan
   */
  @Get('loans/:loanId/payment-history')
  getLoanPaymentHistory(@Param('loanId') loanId: string) {
    return this.loanOfficersService.getLoanPaymentHistory(+loanId);
  }

  /**
   * Get penalty records for a loan
   */
  @Get('loans/:loanId/penalties')
  getLoanPenalties(@Param('loanId') loanId: string) {
    return this.loanOfficersService.getLoanPenalties(+loanId);
  }

  /**
   * Approve a loan application
   */
  @Post('loans/:loanId/approve')
  approveLoan(
    @Param('loanId') loanId: string,
    @Body() approveLoanDto: LoanOfficerApproveLoanDto,
    @GetUser('userId') officerId: number,
  ) {
    approveLoanDto.loanId = +loanId;
    return this.loanOfficersService.approveLoan(approveLoanDto, officerId);
  }

  /**
   * Reject a loan application
   */
  @Post('loans/:loanId/reject')
  rejectLoan(
    @Param('loanId') loanId: string,
    @Body() rejectLoanDto: LoanOfficerRejectLoanDto,
    @GetUser('userId') officerId: number,
  ) {
    rejectLoanDto.loanId = +loanId;
    return this.loanOfficersService.rejectLoan(rejectLoanDto, officerId);
  }

  /**
   * Process EMI payment for a loan
   */
  @Post('loans/:loanId/process-payment')
  processLoanPayment(
    @Param('loanId') loanId: string,
    @Body() paymentDto: ProcessLoanPaymentDto,
    @GetUser('userId') officerId: number,
  ) {
    paymentDto.loanId = +loanId;
    return this.loanOfficersService.processLoanPayment(paymentDto, officerId);
  }

  /**
   * Update repayment schedule
   */
  @Put('loans/:loanId/repayment-schedule')
  updateRepaymentSchedule(
    @Param('loanId') loanId: string,
    @Body() updateDto: UpdateRepaymentScheduleDto,
  ) {
    updateDto.loanId = +loanId;
    return this.loanOfficersService.updateRepaymentSchedule(updateDto);
  }

  /**
   * Add remarks to a loan
   */
  @Post('loans/:loanId/remarks')
  addLoanRemarks(
    @Param('loanId') loanId: string,
    @Body() remarksDto: AddLoanRemarksDto,
  ) {
    remarksDto.loanId = +loanId;
    return this.loanOfficersService.addLoanRemarks(remarksDto);
  }

  /**
   * Get loan monitoring dashboard
   */
  @Get('dashboard/overview')
  getLoanMonitoringDashboard() {
    return this.loanOfficersService.getLoanMonitoringDashboard();
  }

  /**
   * Get overdue loans
   */
  @Get('dashboard/overdue')
  getOverdueLoans() {
    return this.loanOfficersService.getOverdueLoans();
  }

  /**
   * Search loans by customer name
   */
  @Get('search/customer')
  searchLoansByCustomer(@Query('name') customerName: string) {
    return this.loanOfficersService.searchLoansByCustomer(customerName);
  }
}
