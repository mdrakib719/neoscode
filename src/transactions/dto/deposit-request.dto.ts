import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class CreateDepositRequestDto {
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

export class ApproveDepositRequestDto {
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class RejectDepositRequestDto {
  @IsString()
  remarks: string;
}
