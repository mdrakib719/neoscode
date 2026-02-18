import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class DepositDto {
  @IsNumber()
  @IsPositive()
  accountId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class WithdrawDto {
  @IsNumber()
  @IsPositive()
  accountId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class TransferDto {
  @IsString()
  fromAccountNumber: string;

  // For internal transfers
  @IsString()
  @IsOptional()
  toAccountNumber?: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  // External transfer fields
  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @IsString()
  @IsOptional()
  externalBankName?: string;

  @IsString()
  @IsOptional()
  externalAccountNumber?: string;

  @IsString()
  @IsOptional()
  externalBeneficiaryName?: string;

  @IsString()
  @IsOptional()
  externalIfscCode?: string;
}

export class ValidateAccountDto {
  @IsString()
  accountNumber: string;
}
