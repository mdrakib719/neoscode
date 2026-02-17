import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { AccountType } from '@/common/enums';

export class CreateAccountDto {
  @IsEnum(AccountType)
  account_type: AccountType;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class CreateFixedDepositDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @Min(3)
  lock_period_months: number;

  @IsNumber()
  @IsOptional()
  interest_rate?: number;
}

export class CreateRecurringDepositDto {
  @IsNumber()
  @IsPositive()
  monthly_amount: number;

  @IsNumber()
  @Min(6)
  lock_period_months: number;

  @IsNumber()
  @IsOptional()
  interest_rate?: number;
}
