import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsInt,
  IsString,
  IsOptional,
} from 'class-validator';
import { LoanType } from '@/common/enums';

export class ApplyLoanDto {
  @IsEnum(LoanType)
  loan_type: LoanType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  interest_rate: number;

  @IsInt()
  @IsPositive()
  tenure_months: number;
}

export class ApproveLoanDto {
  @IsString()
  @IsOptional()
  remarks?: string;
}
