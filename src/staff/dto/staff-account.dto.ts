import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { AccountType } from '@/common/enums';

/**
 * DTO for staff to view customer account details
 */
export class ViewAccountDetailsDto {
  customerId: number;
}

/**
 * DTO for staff to update account limits
 */
export class UpdateAccountLimitsDto {
  accountId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyWithdrawalLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyTransferLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyWithdrawalLimit?: number;
}

/**
 * DTO for staff to freeze/unfreeze an account (mirrors admin pattern)
 */
export class FreezeAccountDto {
  @IsBoolean()
  isFrozen: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * DTO for staff to perform deposit on behalf of customer
 */
export class StaffDepositDto {
  @IsNumber()
  customerId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  reference: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for staff to perform withdrawal on behalf of customer
 */
export class StaffWithdrawDto {
  @IsNumber()
  customerId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  reference: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for staff to perform transfer on behalf of customer
 */
export class StaffTransferDto {
  @IsNumber()
  fromAccountId: number;

  @IsNumber()
  toAccountId: number;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  reference: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for staff to view customer details with KYC
 */
export class ViewCustomerKYCDto {
  customerId: number;
}

/**
 * DTO for staff to update customer KYC status
 */
export class UpdateCustomerKYCDto {
  customerId: number;

  @IsString()
  kycStatus: string;

  @IsOptional()
  @IsString()
  kycDocuments?: string;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}

/**
 * DTO for customer service assistance
 */
export class CustomerServiceRequestDto {
  @IsNumber()
  customerId: number;

  @IsString()
  issueType: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}
