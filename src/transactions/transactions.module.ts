import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { DepositRequest } from './entities/deposit-request.entity';
import { Account } from '@/accounts/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Beneficiary,
      DepositRequest,
      Account,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
