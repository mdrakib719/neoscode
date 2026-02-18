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
import {
  DepositDto,
  WithdrawDto,
  TransferDto,
  ValidateAccountDto,
} from './dto/transaction.dto';
import {
  CreateDepositRequestDto,
  ApproveDepositRequestDto,
  RejectDepositRequestDto,
} from './dto/deposit-request.dto';
import { AddBeneficiaryDto, UpdateBeneficiaryDto } from './dto/beneficiary.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { UserRole } from '@/common/enums';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  // Deposit Request Endpoints
  @Post('deposit-requests')
  createDepositRequest(
    @Body() createDepositRequestDto: CreateDepositRequestDto,
    @GetUser('userId') userId: number,
  ) {
    return this.transactionsService.createDepositRequest(
      createDepositRequestDto,
      userId,
    );
  }

  @Get('deposit-requests')
  getDepositRequests(
    @GetUser('userId') userId: number,
    @GetUser('role') role: string,
  ) {
    // Admins and employees can see all deposit requests
    if (role === UserRole.ADMIN || role === UserRole.EMPLOYEE) {
      return this.transactionsService.getAllDepositRequests();
    }
    // Customers see only their deposit requests
    return this.transactionsService.getUserDepositRequests(userId);
  }

  @Put('deposit-requests/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  approveDepositRequest(
    @Param('id') id: string,
    @GetUser('userId') adminId: number,
    @Body() approveDto: ApproveDepositRequestDto,
  ) {
    return this.transactionsService.approveDepositRequest(
      +id,
      adminId,
      approveDto,
    );
  }

  @Put('deposit-requests/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  rejectDepositRequest(
    @Param('id') id: string,
    @GetUser('userId') adminId: number,
    @Body() rejectDto: RejectDepositRequestDto,
  ) {
    return this.transactionsService.rejectDepositRequest(
      +id,
      adminId,
      rejectDto,
    );
  }

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

  @Post('validate-account')
  validateAccount(@Body() dto: ValidateAccountDto) {
    return this.transactionsService.validateAccountNumber(dto.accountNumber);
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
