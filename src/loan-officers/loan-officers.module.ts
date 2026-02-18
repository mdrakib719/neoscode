import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanOfficersController } from './loan-officers.controller';
import { LoanOfficersService } from './loan-officers.service';
import { Loan } from '@/loans/entities/loan.entity';
import { LoanPayment } from '@/loans/entities/loan-payment.entity';
import { User } from '@/users/entities/user.entity';
import { Account } from '@/accounts/entities/account.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, LoanPayment, User, Account, Transaction]),
    AuthModule,
  ],
  controllers: [LoanOfficersController],
  providers: [LoanOfficersService],
  exports: [LoanOfficersService],
})
export class LoanOfficersModule {}
