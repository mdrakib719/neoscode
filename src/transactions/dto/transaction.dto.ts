import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

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
  @IsNumber()
  @IsPositive()
  fromAccountId: number;

  @IsNumber()
  @IsPositive()
  toAccountId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}
