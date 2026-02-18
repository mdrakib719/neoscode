import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '@/users/entities/user.entity';
import { Account } from '@/accounts/entities/account.entity';
import { AccountDeletionRequest } from '@/accounts/entities/account-deletion-request.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { Loan } from '@/loans/entities/loan.entity';
import { SystemConfig } from './entities/system-config.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Account,
      AccountDeletionRequest,
      Transaction,
      Loan,
      SystemConfig,
      AuditLog,
    ]),
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
