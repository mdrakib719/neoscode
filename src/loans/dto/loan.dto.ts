import {
  IsEnum,
  IsNumber,
  IsPositive,
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
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

export class PayEMIDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsPositive()
  account_id: number;

  @IsInt()
  @IsOptional()
  installment_number?: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
