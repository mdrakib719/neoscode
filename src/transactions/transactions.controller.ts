import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto, WithdrawDto, TransferDto } from './dto/transaction.dto';
import { AddBeneficiaryDto, UpdateBeneficiaryDto } from './dto/beneficiary.dto';
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

  // Beneficiary Management Endpoints
  @Post('beneficiaries')
  addBeneficiary(
    @Body() addBeneficiaryDto: AddBeneficiaryDto,
    @GetUser('userId') userId: number,
  ) {
    return this.transactionsService.addBeneficiary(addBeneficiaryDto, userId);
  }

  @Get('beneficiaries')
  getBeneficiaries(@GetUser('userId') userId: number) {
    return this.transactionsService.getBeneficiaries(userId);
  }

  @Get('beneficiaries/:id')
  getBeneficiaryById(
    @Param('id') beneficiaryId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.transactionsService.getBeneficiaryById(beneficiaryId, userId);
  }

  @Put('beneficiaries/:id')
  updateBeneficiary(
    @Param('id') beneficiaryId: number,
    @Body() updateBeneficiaryDto: UpdateBeneficiaryDto,
    @GetUser('userId') userId: number,
  ) {
    return this.transactionsService.updateBeneficiary(
      beneficiaryId,
      updateBeneficiaryDto,
      userId,
    );
  }

  @Delete('beneficiaries/:id')
  deleteBeneficiary(
    @Param('id') beneficiaryId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.transactionsService.deleteBeneficiary(beneficiaryId, userId);
  }
}
