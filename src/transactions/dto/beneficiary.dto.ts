import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class AddBeneficiaryDto {
  @IsString()
  @IsNotEmpty()
  beneficiary_name: string;

  @IsString()
  @IsNotEmpty()
  account_number: string;

  @IsString()
  @IsOptional()
  bank_name?: string;

  @IsString()
  @IsOptional()
  ifsc_code?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBeneficiaryDto {
  @IsString()
  @IsOptional()
  beneficiary_name?: string;

  @IsString()
  @IsOptional()
  account_number?: string;

  @IsString()
  @IsOptional()
  bank_name?: string;

  @IsString()
  @IsOptional()
  ifsc_code?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
