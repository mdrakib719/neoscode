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
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UserRole } from '@/common/enums';
import {
  UpdateAccountLimitsDto,
  FreezeAccountDto,
  StaffDepositDto,
  StaffWithdrawDto,
  StaffTransferDto,
} from './dto/staff-account.dto';

@Controller('staff/accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
export class StaffController {
  constructor(private staffService: StaffService) {}

  /**
   * Get all customers
   */
  @Get('customers')
  getAllCustomers() {
    return this.staffService.getAllCustomers();
  }

  /**
   * Search customers by name or email
   */
  @Get('customers/search')
  searchCustomers(@Query('q') query: string) {
    return this.staffService.searchCustomers(query);
  }

  /**
   * Get specific customer details with all accounts and loans
   */
  @Get('customers/:customerId')
  getCustomerDetails(@Param('customerId') customerId: string) {
    return this.staffService.getCustomerDetails(+customerId);
  }

  /**
   * Get customer account summary (total balance, account count, etc)
   */
  @Get('customers/:customerId/summary')
  getCustomerAccountSummary(@Param('customerId') customerId: string) {
    return this.staffService.getCustomerAccountSummary(+customerId);
  }

  /**
   * Get all accounts for a customer
   */
  @Get('customers/:customerId/all-accounts')
  getCustomerAccounts(@Param('customerId') customerId: string) {
    return this.staffService.getCustomerAccounts(+customerId);
  }

  /**
   * Get specific account details
   */
  @Get(':accountId/details')
  getAccountDetails(@Param('accountId') accountId: string) {
    return this.staffService.getAccountDetails(+accountId);
  }

  /**
   * Update account limits (daily/monthly withdrawal and transfer limits)
   */
  @Put(':accountId/limits')
  updateAccountLimits(@Body() updateLimitsDto: UpdateAccountLimitsDto) {
    return this.staffService.updateAccountLimits(updateLimitsDto);
  }

  /**
   * Freeze or unfreeze an account (isFrozen flag in body, mirrors admin)
   */
  @Put(':accountId/freeze')
  freezeAccount(
    @Param('accountId') accountId: string,
    @Body() dto: FreezeAccountDto,
  ) {
    return this.staffService.freezeAccount(+accountId, dto);
  }

  /**
   * Perform deposit on behalf of customer
   */
  @Post('deposit')
  performDeposit(
    @Body() depositDto: StaffDepositDto,
    @GetUser('userId') staffId: number,
  ) {
    return this.staffService.performDeposit(depositDto, staffId);
  }

  /**
   * Perform withdrawal on behalf of customer
   */
  @Post('withdraw')
  performWithdrawal(
    @Body() withdrawDto: StaffWithdrawDto,
    @GetUser('userId') staffId: number,
  ) {
    return this.staffService.performWithdrawal(withdrawDto, staffId);
  }

  /**
   * Perform transfer on behalf of customer
   */
  @Post('transfer')
  performTransfer(
    @Body() transferDto: StaffTransferDto,
    @GetUser('userId') staffId: number,
  ) {
    return this.staffService.performTransfer(transferDto, staffId);
  }

  /**
   * Get transaction history for a customer
   */
  @Get('customers/:customerId/transactions')
  getCustomerTransactionHistory(
    @Param('customerId') customerId: string,
    @Query('limit') limit?: string,
  ) {
    return this.staffService.getCustomerTransactionHistory(
      +customerId,
      limit ? +limit : 50,
    );
  }

  /**
   * Get transaction history for specific account
   */
  @Get(':accountId/transactions')
  getAccountTransactionHistory(
    @Param('accountId') accountId: string,
    @Query('limit') limit?: string,
  ) {
    return this.staffService.getAccountTransactionHistory(
      +accountId,
      limit ? +limit : 50,
    );
  }
}
