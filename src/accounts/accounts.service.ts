import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountDeletionRequest } from './entities/account-deletion-request.entity';
import {
  CreateAccountDto,
  CreateFixedDepositDto,
  CreateRecurringDepositDto,
} from './dto/account.dto';
import { AccountType } from '@/common/enums';
import * as crypto from 'crypto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(AccountDeletionRequest)
    private deletionRequestRepository: Repository<AccountDeletionRequest>,
    private dataSource: DataSource,
  ) {}

  private generateAccountNumber(): string {
    // Generate a random 12-digit account number
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return timestamp + random;
  }

  async create(
    userId: number,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    const accountNumber = this.generateAccountNumber();

    const account = this.accountRepository.create({
      ...createAccountDto,
      account_number: accountNumber,
      user_id: userId,
      currency: createAccountDto.currency || 'USD',
    });

    return this.accountRepository.save(account);
  }

  async findAllByUser(userId: number): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user_id: userId, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, userId?: number): Promise<Account> {
    const whereCondition: any = { id };
    if (userId) {
      whereCondition.user_id = userId;
    }

    const account = await this.accountRepository.findOne({
      where: whereCondition,
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findByAccountNumber(accountNumber: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { account_number: accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async updateBalance(accountId: number, amount: number): Promise<Account> {
    const account = await this.findOne(accountId);
    account.balance = Number(account.balance) + amount;
    return this.accountRepository.save(account);
  }

  // Fixed Deposit Methods
  async createFixedDeposit(
    userId: number,
    createFDDto: CreateFixedDepositDto,
  ): Promise<Account> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get default interest rate if not provided
      const interestRate = createFDDto.interest_rate || 7.5; // 7.5% default for FD

      // Calculate maturity date
      const startDate = new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(
        maturityDate.getMonth() + createFDDto.lock_period_months,
      );

      // Calculate maturity amount using compound interest
      // A = P(1 + r/n)^(nt) where n=1 (annual compounding)
      const principal = createFDDto.amount;
      const years = createFDDto.lock_period_months / 12;
      const maturityAmount =
        principal * Math.pow(1 + interestRate / 100, years);

      // Create FD account
      const accountNumber = this.generateAccountNumber();
      const account = queryRunner.manager.create(Account, {
        account_number: accountNumber,
        user_id: userId,
        account_type: AccountType.FIXED_DEPOSIT,
        balance: createFDDto.amount,
        currency: 'USD',
        deposit_start_date: startDate,
        maturity_date: maturityDate,
        lock_period_months: createFDDto.lock_period_months,
        deposit_interest_rate: interestRate,
        maturity_amount: Number(maturityAmount.toFixed(2)),
      });

      const savedAccount = await queryRunner.manager.save(Account, account);

      await queryRunner.commitTransaction();
      return savedAccount;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Recurring Deposit Methods
  async createRecurringDeposit(
    userId: number,
    createRDDto: CreateRecurringDepositDto,
  ): Promise<Account> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get default interest rate if not provided
      const interestRate = createRDDto.interest_rate || 6.5; // 6.5% default for RD

      // Calculate maturity date
      const startDate = new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(
        maturityDate.getMonth() + createRDDto.lock_period_months,
      );

      // Calculate maturity amount for RD
      // M = P × n × (n + 1) / 2 × (1 + i)
      // where P = monthly deposit, n = number of months, i = monthly interest rate
      const monthlyRate = interestRate / 100 / 12;
      const n = createRDDto.lock_period_months;
      const totalDeposit = createRDDto.monthly_amount * n;
      const interest =
        createRDDto.monthly_amount * ((n * (n + 1)) / 2) * monthlyRate;
      const maturityAmount = totalDeposit + interest;

      // Create RD account
      const accountNumber = this.generateAccountNumber();
      const account = queryRunner.manager.create(Account, {
        account_number: accountNumber,
        user_id: userId,
        account_type: AccountType.RECURRING_DEPOSIT,
        balance: 0, // Starts with 0, customer deposits monthly
        currency: 'USD',
        deposit_start_date: startDate,
        maturity_date: maturityDate,
        lock_period_months: createRDDto.lock_period_months,
        deposit_interest_rate: interestRate,
        monthly_deposit_amount: createRDDto.monthly_amount,
        maturity_amount: Number(maturityAmount.toFixed(2)),
      });

      const savedAccount = await queryRunner.manager.save(Account, account);

      await queryRunner.commitTransaction();
      return savedAccount;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Check if withdrawal is allowed for FD/RD
  async canWithdraw(
    accountId: number,
  ): Promise<{ allowed: boolean; message?: string }> {
    const account = await this.findOne(accountId);

    if (
      account.account_type === AccountType.FIXED_DEPOSIT ||
      account.account_type === AccountType.RECURRING_DEPOSIT
    ) {
      const today = new Date();
      const maturityDate = new Date(account.maturity_date);

      if (today < maturityDate) {
        const penaltyRate = 2; // 2% penalty for premature withdrawal
        const penaltyAmount = (Number(account.balance) * penaltyRate) / 100;

        return {
          allowed: true,
          message: `Premature withdrawal will incur a penalty of ${penaltyRate}%. Penalty amount: $${penaltyAmount.toFixed(2)}`,
        };
      }
    }

    return { allowed: true };
  }

  // Get account details with maturity calculations
  async getDepositAccountDetails(accountId: number, userId: number) {
    const account = await this.findOne(accountId, userId);

    if (
      account.account_type !== AccountType.FIXED_DEPOSIT &&
      account.account_type !== AccountType.RECURRING_DEPOSIT
    ) {
      throw new BadRequestException('This is not a deposit account');
    }

    const today = new Date();
    const maturityDate = new Date(account.maturity_date);
    const daysToMaturity = Math.floor(
      (maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      account,
      isMatured: today >= maturityDate,
      daysToMaturity: daysToMaturity > 0 ? daysToMaturity : 0,
      currentValue: account.balance,
      maturityValue: account.maturity_amount,
      interestEarned: Number(account.maturity_amount) - Number(account.balance),
    };
  }

  // Account deletion methods
  async requestAccountDeletion(
    accountId: number,
    userId: number,
    reason?: string,
  ): Promise<{ requiresApproval: boolean; message: string }> {
    const account = await this.findOne(accountId, userId);

    if (account.deleted_at) {
      throw new BadRequestException('Account is already deleted');
    }

    const balance = Number(account.balance);

    // Cannot delete with negative balance
    if (balance < 0) {
      throw new BadRequestException(
        'Cannot delete account with negative balance. Please clear your debt first.',
      );
    }

    // If balance is zero, delete immediately
    if (balance === 0) {
      account.deleted_at = new Date();
      account.deletion_reason = reason || 'User requested deletion';
      account.status = 'DELETED';
      await this.accountRepository.save(account);

      return {
        requiresApproval: false,
        message: 'Account deleted successfully',
      };
    }

    // If balance > 0, create deletion request for admin approval
    const existingRequest = await this.deletionRequestRepository.findOne({
      where: {
        account_id: accountId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'A deletion request is already pending for this account',
      );
    }

    const deletionRequest = this.deletionRequestRepository.create({
      account_id: accountId,
      user_id: userId,
      balance_at_request: balance,
      reason: reason || 'User requested deletion',
      status: 'PENDING',
    });

    await this.deletionRequestRepository.save(deletionRequest);

    return {
      requiresApproval: true,
      message:
        'Account has a positive balance. Deletion request submitted for admin approval.',
    };
  }

  // Get all deletion requests (for admin)
  async getAllDeletionRequests(): Promise<AccountDeletionRequest[]> {
    return this.deletionRequestRepository.find({
      relations: ['account', 'user', 'processor'],
      order: { created_at: 'DESC' },
    });
  }

  // Get pending deletion requests for a user
  async getUserDeletionRequests(
    userId: number,
  ): Promise<AccountDeletionRequest[]> {
    return this.deletionRequestRepository.find({
      where: { user_id: userId },
      relations: ['account'],
      order: { created_at: 'DESC' },
    });
  }

  // Approve deletion request (admin only)
  async approveDeletionRequest(
    requestId: number,
    adminId: number,
    remarks?: string,
  ): Promise<AccountDeletionRequest> {
    const request = await this.deletionRequestRepository.findOne({
      where: { id: requestId },
      relations: ['account'],
    });

    if (!request) {
      throw new NotFoundException('Deletion request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request has already been processed');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mark account as deleted
      await queryRunner.manager.update(
        Account,
        { id: request.account_id },
        {
          deleted_at: new Date(),
          deletion_reason: `Admin approved: ${remarks || 'No remarks'}`,
          status: 'DELETED',
        },
      );

      // Update deletion request
      request.status = 'APPROVED';
      request.admin_remarks = remarks;
      request.processed_by = adminId;
      request.processed_at = new Date();
      await queryRunner.manager.save(AccountDeletionRequest, request);

      await queryRunner.commitTransaction();
      return request;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Reject deletion request (admin only)
  async rejectDeletionRequest(
    requestId: number,
    adminId: number,
    remarks: string,
  ): Promise<AccountDeletionRequest> {
    const request = await this.deletionRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Deletion request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request has already been processed');
    }

    request.status = 'REJECTED';
    request.admin_remarks = remarks;
    request.processed_by = adminId;
    request.processed_at = new Date();

    return this.deletionRequestRepository.save(request);
  }

  // Get all accounts including deleted (admin only)
  async findAllIncludingDeleted(): Promise<Account[]> {
    return this.accountRepository.find({
      order: { created_at: 'DESC' },
      relations: ['user'],
    });
  }
}
