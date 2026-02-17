import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import {
  CreateAccountDto,
  CreateFixedDepositDto,
  CreateRecurringDepositDto,
} from './dto/account.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  create(
    @GetUser('userId') userId: number,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(userId, createAccountDto);
  }

  @Get()
  findAll(@GetUser('userId') userId: number) {
    return this.accountsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.accountsService.findOne(+id, userId);
  }

  // Fixed Deposit Endpoints
  @Post('fixed-deposit')
  createFixedDeposit(
    @GetUser('userId') userId: number,
    @Body() createFDDto: CreateFixedDepositDto,
  ) {
    return this.accountsService.createFixedDeposit(userId, createFDDto);
  }

  // Recurring Deposit Endpoints
  @Post('recurring-deposit')
  createRecurringDeposit(
    @GetUser('userId') userId: number,
    @Body() createRDDto: CreateRecurringDepositDto,
  ) {
    return this.accountsService.createRecurringDeposit(userId, createRDDto);
  }

  // Get deposit account details
  @Get('deposit/:id/details')
  getDepositDetails(
    @Param('id') accountId: string,
    @GetUser('userId') userId: number,
  ) {
    return this.accountsService.getDepositAccountDetails(+accountId, userId);
  }

  // Check withdrawal eligibility
  @Get(':id/can-withdraw')
  canWithdraw(@Param('id') accountId: string) {
    return this.accountsService.canWithdraw(+accountId);
  }

  // Delete account (or create deletion request)
  @Delete(':id')
  deleteAccount(
    @Param('id') id: string,
    @GetUser('userId') userId: number,
    @Body('reason') reason?: string,
  ) {
    return this.accountsService.requestAccountDeletion(+id, userId, reason);
  }

  // Get user's deletion requests
  @Get('deletion-requests/my-requests')
  getUserDeletionRequests(@GetUser('userId') userId: number) {
    return this.accountsService.getUserDeletionRequests(userId);
  }
}
