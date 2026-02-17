import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/transaction.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post('deposit')
  deposit(@Body() depositDto: DepositDto, @GetUser('userId') userId: number) {
    return this.transactionsService.deposit(depositDto, userId);
  }

  @Post('withdraw')
  withdraw(
    @Body() withdrawDto: WithdrawDto,
    @GetUser('userId') userId: number,
  ) {
    return this.transactionsService.withdraw(withdrawDto, userId);
  }

  @Post('transfer')
  transfer(
    @Body() transferDto: TransferDto,
    @GetUser('userId') userId: number,
  ) {
    return this.transactionsService.transfer(transferDto, userId);
  }

  @Get()
  getHistory(
    @GetUser('userId') userId: number,
    @Query('accountId') accountId?: string,
  ) {
    return this.transactionsService.getTransactionHistory(
      userId,
      accountId ? +accountId : undefined,
    );
  }
}
