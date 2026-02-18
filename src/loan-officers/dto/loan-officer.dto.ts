import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
  IsArray,
} from 'class-validator';
import { LoanStatus } from '@/common/enums';

/**
 * DTO for loan officer to approve a loan
 */
export class LoanOfficerApproveLoanDto {
  @IsOptional()
  @IsNumber()
  loanId: number;

  @IsString()
  approvalNotes: string;

  @IsOptional()
  @IsString()
  recommendedEMI?: string;
}

/**
 * DTO for loan officer to reject a loan
 */
export class LoanOfficerRejectLoanDto {
  @IsOptional()
  @IsNumber()
  loanId: number;

  @IsString()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  suggestedAlternatives?: string;
}

/**
 * DTO for loan officer to request additional documents
 */
export class RequestLoanDocumentsDto {
  @IsOptional()
  @IsNumber()
  loanId: number;

  @IsArray()
  @IsString({ each: true })
  requiredDocuments: string[];

  @IsOptional()
  @IsString()
  remarks?: string;
}

/**
 * DTO for loan officer to process loan payment
 */
export class ProcessLoanPaymentDto {
  @IsOptional()
  @IsNumber()
  loanId: number;

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
 * DTO for loan officer to update repayment schedule
 */
export class UpdateRepaymentScheduleDto {
  @IsNumber()
  loanId: number;

  @IsNumber()
  @Min(1)
  newTenureMonths: number;

  @IsNumber()
  @Min(0.01)
  newEMIAmount: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * DTO for loan officer to filter/search loans
 */
export class LoanFilterDto {
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  loanType?: string;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @IsOptional()
  @IsNumber()
  daysOld?: number;
}

/**
 * DTO for loan officer to add remarks to loan
 */
export class AddLoanRemarksDto {
  @IsNumber()
  loanId: number;

  @IsString()
  remarks: string;
}
