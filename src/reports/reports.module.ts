import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Account } from '@/accounts/entities/account.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { Loan } from '@/loans/entities/loan.entity';
import { User } from '@/users/entities/user.entity';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction, Loan, User]),
    AuthModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
