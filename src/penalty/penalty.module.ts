import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenaltySchedulerService } from './penalty.scheduler.service';
import { PenaltyController } from './penalty.controller';
import { Loan } from '@/loans/entities/loan.entity';
import { LoanPayment } from '@/loans/entities/loan-payment.entity';
import { LoanPenalty } from '@/loans/entities/loan-penalty.entity';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, LoanPayment, LoanPenalty]),
    AuthModule,
  ],
  controllers: [PenaltyController],
  providers: [PenaltySchedulerService],
  exports: [PenaltySchedulerService],
})
export class PenaltyModule {}
