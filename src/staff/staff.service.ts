import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '@/accounts/entities/account.entity';
import { User } from '@/users/entities/user.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { UserRole, TransactionStatus, TransactionType } from '@/common/enums';
import {
  UpdateAccountLimitsDto,
  FreezeAccountDto,
  StaffDepositDto,
  StaffWithdrawDto,
  StaffTransferDto,
} from './dto/staff-account.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Get all customers for staff to manage
   */
  async getAllCustomers(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.CUSTOMER, isActive: true },
      relations: ['accounts', 'loans'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get a specific customer's details
   */
  async getCustomerDetails(customerId: number): Promise<User> {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: UserRole.CUSTOMER },
      relations: ['accounts', 'loans'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  /**
   * Get all accounts for a customer
   */
  async getCustomerAccounts(customerId: number): Promise<Account[]> {
    // Verify customer exists
    await this.getCustomerDetails(customerId);

    return this.accountRepository.find({
      where: { user_id: customerId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get specific account details
   */
  async getAccountDetails(accountId: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['user', 'outgoing_transactions', 'incoming_transactions'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  /**
   * Update account withdrawal/transfer limits
   */
  async updateAccountLimits(
    updateLimitsDto: UpdateAccountLimitsDto,
  ): Promise<Account> {
    const account = await this.getAccountDetails(updateLimitsDto.accountId);

    if (updateLimitsDto.dailyWithdrawalLimit !== undefined) {
      account.dailyWithdrawalLimit = updateLimitsDto.dailyWithdrawalLimit;
    }

    if (updateLimitsDto.dailyTransferLimit !== undefined) {
      account.dailyTransferLimit = updateLimitsDto.dailyTransferLimit;
    }

    if (updateLimitsDto.monthlyWithdrawalLimit !== undefined) {
      account.monthlyWithdrawalLimit = updateLimitsDto.monthlyWithdrawalLimit;
    }

    return this.accountRepository.save(account);
  }

  /**
   * Freeze or unfreeze an account (mirrors admin pattern)
   */
  async freezeAccount(
    accountId: number,
    dto: FreezeAccountDto,
  ): Promise<Account> {
    const account = await this.getAccountDetails(accountId);

    if (dto.isFrozen) {
      if (account.isFrozen) {
        throw new BadRequestException('Account is already frozen');
      }
      account.isFrozen = true;
      account.frozen_at = new Date();
      account.freeze_reason = dto.reason || null;
      account.status = 'FROZEN';
    } else {
      if (!account.isFrozen) {
        throw new BadRequestException('Account is not frozen');
      }
      account.isFrozen = false;
      account.frozen_at = null;
      account.freeze_reason = null;
      account.status = 'ACTIVE';
    }

    return this.accountRepository.save(account);
  }

  /**
   * Staff performs deposit on behalf of customer
   */
  async performDeposit(
    depositDto: StaffDepositDto,
    staffId: number,
  ): Promise<Transaction> {
    // Verify customer exists
    await this.getCustomerDetails(depositDto.customerId);

    // Get customer's primary account (first or SAVINGS)
    const accounts = await this.getCustomerAccounts(depositDto.customerId);
    if (accounts.length === 0) {
      throw new BadRequestException('Customer has no accounts');
    }

    const targetAccount = accounts[0];

    // Create transaction record
    const transaction = this.transactionRepository.create({
      to_account_id: targetAccount.id,
      amount: depositDto.amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETED,
      description: depositDto.notes || `Staff deposit: ${depositDto.reference}`,
    });

    await this.transactionRepository.save(transaction);

    // Update account balance
    targetAccount.balance = Number(targetAccount.balance) + depositDto.amount;
    await this.accountRepository.save(targetAccount);

    return transaction;
  }

  /**
   * Staff performs withdrawal on behalf of customer
   */
  async performWithdrawal(
    withdrawDto: StaffWithdrawDto,
    staffId: number,
  ): Promise<Transaction> {
    // Verify customer exists
    await this.getCustomerDetails(withdrawDto.customerId);

    // Get customer's primary account
    const accounts = await this.getCustomerAccounts(withdrawDto.customerId);
    if (accounts.length === 0) {
      throw new BadRequestException('Customer has no accounts');
    }

    const sourceAccount = accounts[0];

    // Check balance
    if (Number(sourceAccount.balance) < withdrawDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create transaction record
    const transaction = this.transactionRepository.create({
      from_account_id: sourceAccount.id,
      amount: withdrawDto.amount,
      type: TransactionType.WITHDRAW,
      status: TransactionStatus.COMPLETED,
      description:
        withdrawDto.notes || `Staff withdrawal: ${withdrawDto.reference}`,
    });

    await this.transactionRepository.save(transaction);

    // Update account balance
    sourceAccount.balance = Number(sourceAccount.balance) - withdrawDto.amount;
    await this.accountRepository.save(sourceAccount);

    return transaction;
  }

  /**
   * Staff performs transfer on behalf of customer
   */
  async performTransfer(
    transferDto: StaffTransferDto,
    staffId: number,
  ): Promise<Transaction> {
    const fromAccount = await this.getAccountDetails(transferDto.fromAccountId);
    const toAccount = await this.getAccountDetails(transferDto.toAccountId);

    // Check balance
    if (Number(fromAccount.balance) < transferDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create transaction record
    const transaction = this.transactionRepository.create({
      from_account_id: fromAccount.id,
      to_account_id: toAccount.id,
      amount: transferDto.amount,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      description:
        transferDto.notes || `Staff transfer: ${transferDto.reference}`,
    });

    await this.transactionRepository.save(transaction);

    // Update account balances
    fromAccount.balance = Number(fromAccount.balance) - transferDto.amount;
    toAccount.balance = Number(toAccount.balance) + transferDto.amount;

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    return transaction;
  }

  /**
   * Get transaction history for a customer
   */
  async getCustomerTransactionHistory(
    customerId: number,
    limit: number = 50,
  ): Promise<Transaction[]> {
    // Verify customer exists
    await this.getCustomerDetails(customerId);

    // Get all customer's accounts
    const accounts = await this.getCustomerAccounts(customerId);
    const accountIds = accounts.map((a) => a.id);

    return this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.from_account_id IN (:...accountIds)', { accountIds })
      .orWhere('transaction.to_account_id IN (:...accountIds)', { accountIds })
      .orderBy('transaction.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Get account transaction history
   */
  async getAccountTransactionHistory(
    accountId: number,
    limit: number = 50,
  ): Promise<Transaction[]> {
    // Verify account exists
    await this.getAccountDetails(accountId);

    return this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.from_account_id = :accountId', { accountId })
      .orWhere('transaction.to_account_id = :accountId', { accountId })
      .orderBy('transaction.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Search customers by name or email
   */
  async searchCustomers(query: string): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.CUSTOMER })
      .andWhere('(user.name LIKE :query OR user.email LIKE :query)', {
        query: `%${query}%`,
      })
      .limit(20)
      .getMany();
  }

  /**
   * Get account summary for a customer
   */
  async getCustomerAccountSummary(customerId: number): Promise<any> {
    const customer = await this.getCustomerDetails(customerId);
    const accounts = await this.getCustomerAccounts(customerId);

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + Number(acc.balance),
      0,
    );

    return {
      customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      totalAccounts: accounts.length,
      totalBalance,
      accounts: accounts.map((acc) => ({
        id: acc.id,
        accountNumber: acc.account_number,
        type: acc.account_type,
        balance: acc.balance,
        status: acc.status,
        isFrozen: acc.isFrozen,
      })),
    };
  }
}
