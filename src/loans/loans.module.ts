import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { Loan } from './entities/loan.entity';
import { LoanPayment } from './entities/loan-payment.entity';
import { Account } from '@/accounts/entities/account.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, LoanPayment, Account, Transaction]),
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
