import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// Explicit entity imports (required for Vercel serverless bundling)
import { User } from '../users/entities/user.entity';
import { Account } from '../accounts/entities/account.entity';
import { AccountDeletionRequest } from '../accounts/entities/account-deletion-request.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Beneficiary } from '../transactions/entities/beneficiary.entity';
import { DepositRequest } from '../transactions/entities/deposit-request.entity';
import { Loan } from '../loans/entities/loan.entity';
import { LoanPayment } from '../loans/entities/loan-payment.entity';
import { LoanPenalty } from '../loans/entities/loan-penalty.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { TokenBlacklist } from '../auth/entities/token-blacklist.entity';
import { SystemConfig } from '../admin/entities/system-config.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isVercel = !!process.env.VERCEL;

    return {
      type: 'mysql',
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_DATABASE'),
      entities: [
        User,
        Account,
        AccountDeletionRequest,
        Transaction,
        Beneficiary,
        DepositRequest,
        Loan,
        LoanPayment,
        LoanPenalty,
        Notification,
        TokenBlacklist,
        SystemConfig,
        AuditLog,
      ],
      synchronize: false,
      logging: false,
      // Serverless-friendly connection settings
      extra: {
        connectionLimit: isVercel || isProduction ? 2 : 10,
        connectTimeout: 20000,
      },
      connectTimeout: 20000,
      // Don't keep connections alive in serverless
      ...(isVercel ? { keepConnectionAlive: false } : {}),
    };
  }
}
