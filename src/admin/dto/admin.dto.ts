import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { UserRole, AccountType } from '@/common/enums';

// User Management DTOs
export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ActivateUserDto {
  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class LockAccountDto {
  @IsBoolean()
  isLocked: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UnlockUserDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class AssignRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

// Account Oversight DTOs
export class FreezeAccountDto {
  @IsBoolean()
  isFrozen: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class CloseAccountDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ModifyAccountLimitDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyWithdrawalLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  dailyTransferLimit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyWithdrawalLimit?: number;
}

// Transaction Control DTOs
export class ReverseTransactionDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class SetTransactionLimitDto {
  @IsNumber()
  @Min(0)
  dailyTransferLimit: number;

  @IsNumber()
  @Min(0)
  dailyWithdrawalLimit: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  perTransactionLimit?: number;
}

export class SetFeeConfigDto {
  @IsNumber()
  @Min(0)
  transferFee: number;

  @IsNumber()
  @Min(0)
  withdrawalFee: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyMaintenanceFee?: number;
}

// System Configuration DTOs
export class SetInterestRateDto {
  @IsEnum(AccountType)
  accountType: AccountType;

  @IsNumber()
  @Min(0)
  interestRate: number;
}

export class SetLoanInterestRateDto {
  @IsString()
  @IsNotEmpty()
  loanType: string;

  @IsNumber()
  @Min(0)
  interestRate: number;
}

export class SetPenaltyRulesDto {
  @IsNumber()
  @Min(0)
  lateFeePercentage: number;

  @IsNumber()
  @Min(0)
  overdraftFee: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumBalanceFee?: number;
}

export class SetCurrencyDto {
  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  @IsOptional()
  exchangeRate?: number;
}
