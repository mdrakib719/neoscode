import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AccountType } from '@/common/enums';

export class CreateAccountDto {
  @IsEnum(AccountType)
  account_type: AccountType;

  @IsString()
  @IsOptional()
  currency?: string;
}
