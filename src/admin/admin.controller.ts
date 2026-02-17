import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UserRole } from '@/common/enums';
import {
  CreateEmployeeDto,
  ActivateUserDto,
  LockAccountDto,
  UnlockUserDto,
  AssignRoleDto,
  ResetPasswordDto,
  FreezeAccountDto,
  CloseAccountDto,
  ModifyAccountLimitDto,
  ReverseTransactionDto,
  SetTransactionLimitDto,
  SetFeeConfigDto,
  SetInterestRateDto,
  SetLoanInterestRateDto,
  SetPenaltyRulesDto,
  SetCurrencyDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== USER & ROLE MANAGEMENT ====================

  /**
   * Create a new bank employee
   */
  @Post('users/employees')
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.createEmployee(createEmployeeDto, adminId);
  }

  /**
   * Activate or deactivate a user
   */
  @Put('users/:id/activation')
  activateUser(
    @Param('id') userId: string,
    @Body() dto: ActivateUserDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.activateUser(+userId, dto, adminId);
  }

  /**
   * Assign a role to a user
   */
  @Put('users/:id/role')
  assignRole(
    @Param('id') userId: string,
    @Body() dto: AssignRoleDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.assignRole(+userId, dto, adminId);
  }

  /**
   * Reset user password
   */
  @Post('users/:id/reset-password')
  resetPassword(
    @Param('id') userId: string,
    @Body() dto: ResetPasswordDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.resetUserPassword(+userId, dto, adminId);
  }

  /**
   * Lock or unlock a user account
   */
  @Put('users/:id/lock')
  lockUser(
    @Param('id') userId: string,
    @Body() dto: LockAccountDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.lockUser(+userId, dto, adminId);
  }

  /**
   * Unlock a locked user account and restore their sessions
   */
  @Put('users/:id/unlock')
  unlockUser(
    @Param('id') userId: string,
    @Body() dto: UnlockUserDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.unlockUser(+userId, dto, adminId);
  }

  // ==================== ACCOUNT OVERSIGHT ====================

  /**
   * Get all accounts in the system
   */
  @Get('accounts')
  getAllAccounts(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllAccounts(+page || 1, +limit || 50);
  }

  /**
   * Freeze or unfreeze an account
   */
  @Put('accounts/:id/freeze')
  freezeAccount(
    @Param('id') accountId: string,
    @Body() dto: FreezeAccountDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.freezeAccount(+accountId, dto, adminId);
  }

  /**
   * Close an account
   */
  @Post('accounts/:id/close')
  closeAccount(
    @Param('id') accountId: string,
    @Body() dto: CloseAccountDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.closeAccount(+accountId, dto, adminId);
  }

  /**
   * Modify account transaction limits
   */
  @Put('accounts/:id/limits')
  modifyAccountLimits(
    @Param('id') accountId: string,
    @Body() dto: ModifyAccountLimitDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.modifyAccountLimits(+accountId, dto, adminId);
  }

  // ==================== TRANSACTION MONITORING ====================

  /**
   * Get all transactions
   */
  @Get('transactions')
  getAllTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllTransactions(
      +page || 1,
      +limit || 100,
      status,
    );
  }

  /**
   * Reverse a transaction
   */
  @Post('transactions/:id/reverse')
  reverseTransaction(
    @Param('id') transactionId: string,
    @Body() dto: ReverseTransactionDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.reverseTransaction(+transactionId, dto, adminId);
  }

  /**
   * Set system-wide transaction limits
   */
  @Put('settings/transaction-limits')
  setTransactionLimits(
    @Body() dto: SetTransactionLimitDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.setTransactionLimits(dto, adminId);
  }

  /**
   * Set fee configuration
   */
  @Put('settings/fees')
  setFeeConfiguration(
    @Body() dto: SetFeeConfigDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.setFeeConfiguration(dto, adminId);
  }

  // ==================== LOAN MANAGEMENT AUTHORITY ====================

  /**
   * Set interest rate for account types
   */
  @Put('settings/interest-rate')
  setInterestRate(
    @Body() dto: SetInterestRateDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.setInterestRate(dto, adminId);
  }

  /**
   * Set loan interest rates
   */
  @Put('settings/loan-interest-rate')
  setLoanInterestRate(
    @Body() dto: SetLoanInterestRateDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.setLoanInterestRate(dto, adminId);
  }

  /**
   * Configure penalty rules
   */
  @Put('settings/penalty-rules')
  setPenaltyRules(
    @Body() dto: SetPenaltyRulesDto,
    @GetUser('userId') adminId: number,
  ) {
    return this.adminService.setPenaltyRules(dto, adminId);
  }

  // ==================== SYSTEM CONFIGURATION ====================

  /**
   * Set currency configuration
   */
  @Put('settings/currency')
  setCurrency(@Body() dto: SetCurrencyDto, @GetUser('userId') adminId: number) {
    return this.adminService.setCurrency(dto, adminId);
  }

  /**
   * Get all system configuration
   */
  @Get('settings/config')
  getSystemConfiguration() {
    return this.adminService.getSystemConfiguration();
  }

  // ==================== SECURITY & AUDIT ====================

  /**
   * Get audit logs
   */
  @Get('audit/logs')
  getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAuditLogs(
      +page || 1,
      +limit || 50,
      userId ? +userId : undefined,
      action,
    );
  }

  /**
   * Get login activity
   */
  @Get('security/login-activity')
  getLoginActivity(@Query('days') days?: string) {
    return this.adminService.getLoginActivity(+days || 7);
  }

  /**
   * Get suspicious activity
   */
  @Get('security/suspicious-activity')
  getSuspiciousActivity() {
    return this.adminService.getSuspiciousActivity();
  }

  // ==================== ACCOUNT DELETION MANAGEMENT ====================

  /**
   * Get all account deletion requests
   */
  @Get('account-deletion-requests')
  getAllDeletionRequests() {
    return this.adminService.getAllDeletionRequests();
  }

  /**
   * Approve account deletion request
   */
  @Put('account-deletion-requests/:id/approve')
  approveDeletionRequest(
    @Param('id') requestId: string,
    @GetUser('userId') adminId: number,
    @Body('remarks') remarks?: string,
  ) {
    return this.adminService.approveDeletionRequest(
      +requestId,
      adminId,
      remarks,
    );
  }

  /**
   * Reject account deletion request
   */
  @Put('account-deletion-requests/:id/reject')
  rejectDeletionRequest(
    @Param('id') requestId: string,
    @GetUser('userId') adminId: number,
    @Body('remarks') remarks: string,
  ) {
    return this.adminService.rejectDeletionRequest(
      +requestId,
      adminId,
      remarks,
    );
  }

  /**
   * Get all accounts including deleted (for history)
   */
  @Get('accounts/all-including-deleted')
  getAllAccountsIncludingDeleted() {
    return this.adminService.getAllAccountsIncludingDeleted();
  }

  // ==================== ANALYTICS & REPORTS ====================

  /**
   * Get admin dashboard statistics
   */
  @Get('dashboard/stats')
  async getDashboardStats() {
    // This would aggregate data from various sources
    return {
      message:
        'Dashboard stats endpoint - to be implemented with specific requirements',
    };
  }
}
