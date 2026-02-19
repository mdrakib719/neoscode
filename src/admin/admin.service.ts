import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Account } from '@/accounts/entities/account.entity';
import { AccountDeletionRequest } from '@/accounts/entities/account-deletion-request.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import { Loan } from '@/loans/entities/loan.entity';
import { SystemConfig } from './entities/system-config.entity';
import { AuditLog } from './entities/audit-log.entity';
import { TokenBlacklistService } from '@/auth/services/token-blacklist.service';
import * as bcrypt from 'bcryptjs';
import {
  CreateEmployeeDto,
  ActivateUserDto,
  LockAccountDto,
  UnlockUserDto,
  AssignRoleDto,
  ResetPasswordDto,
  FreezeAccountDto,
  CloseAccountDto,
  ModifyAccountLimitDto,
  ReverseTransactionDto,
  SetTransactionLimitDto,
  SetFeeConfigDto,
  SetInterestRateDto,
  SetLoanInterestRateDto,
  SetPenaltyRulesDto,
  SetCurrencyDto,
} from './dto/admin.dto';
import { UserRole, TransactionStatus, TransactionType } from '@/common/enums';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(AccountDeletionRequest)
    private deletionRequestRepository: Repository<AccountDeletionRequest>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
    private dataSource: DataSource,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  // ==================== USER & ROLE MANAGEMENT ====================

  async createEmployee(createEmployeeDto: CreateEmployeeDto, adminId: number) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

    const employee = this.userRepository.create({
      ...createEmployeeDto,
      password: hashedPassword,
      role: UserRole.EMPLOYEE,
    });

    const savedEmployee = await this.userRepository.save(employee);

    await this.logAudit(
      adminId,
      'CREATE_EMPLOYEE',
      'user',
      savedEmployee.id,
      `Created employee: ${savedEmployee.email}`,
    );

    delete savedEmployee.password;
    return savedEmployee;
  }

  async activateUser(userId: number, dto: ActivateUserDto, adminId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = dto.isActive;
    const savedUser = await this.userRepository.save(user);

    // If deactivating user, blacklist all their tokens
    if (!dto.isActive) {
      await this.tokenBlacklistService.blacklistAllUserTokens(userId);
    } else {
      // If reactivating, remove from ban list
      await this.tokenBlacklistService.unbanUser(userId);
    }

    await this.logAudit(
      adminId,
      dto.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      'user',
      userId,
      dto.reason || 'No reason provided',
    );

    return {
      message: `User ${dto.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        isActive: savedUser.isActive,
      },
    };
  }

  async unlockUser(userId: number, dto: UnlockUserDto, adminId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isLocked) {
      return {
        message: 'User account is already unlocked',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isLocked: user.isLocked,
        },
      };
    }

    user.isLocked = false;
    user.locked_at = null;
    user.lock_reason = null;
    const savedUser = await this.userRepository.save(user);

    // Remove the user from the token ban list so existing sessions become valid again
    await this.tokenBlacklistService.unbanUser(userId);

    await this.logAudit(
      adminId,
      'UNLOCK_USER',
      'user',
      userId,
      dto.reason || 'Account unlocked by admin',
    );

    return {
      message: 'User account unlocked successfully. Active sessions restored.',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        isLocked: savedUser.isLocked,
        locked_at: savedUser.locked_at,
        lock_reason: savedUser.lock_reason,
      },
    };
  }

  async assignRole(userId: number, dto: AssignRoleDto, adminId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldRole = user.role;
    user.role = dto.role;
    await this.userRepository.save(user);

    await this.logAudit(
      adminId,
      'ASSIGN_ROLE',
      'user',
      userId,
      `Changed role from ${oldRole} to ${dto.role}`,
    );

    return {
      message: 'Role assigned successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async resetUserPassword(
    userId: number,
    dto: ResetPasswordDto,
    adminId: number,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.logAudit(
      adminId,
      'RESET_PASSWORD',
      'user',
      userId,
      `Reset password for user ${user.email}`,
    );

    return { message: 'Password reset successfully' };
  }

  async lockUser(userId: number, dto: LockAccountDto, adminId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isLocked = dto.isLocked;
    user.locked_at = dto.isLocked ? new Date() : null;
    user.lock_reason = dto.isLocked ? dto.reason || 'Locked by admin' : null;

    const savedUser = await this.userRepository.save(user);

    // If locking user, blacklist all their tokens
    if (dto.isLocked) {
      await this.tokenBlacklistService.blacklistAllUserTokens(userId);
    } else {
      // If unlocking, remove from ban list
      await this.tokenBlacklistService.unbanUser(userId);
    }

    await this.logAudit(
      adminId,
      dto.isLocked ? 'LOCK_USER' : 'UNLOCK_USER',
      'user',
      userId,
      dto.reason || 'Suspicious activity',
    );

    return {
      message: `User ${dto.isLocked ? 'locked' : 'unlocked'} successfully`,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        isLocked: savedUser.isLocked,
      },
    };
  }

  // ==================== ACCOUNT OVERSIGHT ====================

  async getAllAccounts(page: number = 1, limit: number = 50) {
    const [accounts, total] = await this.accountRepository.findAndCount({
      relations: ['user'],
      take: limit,
      skip: (page - 1) * limit,
      order: { created_at: 'DESC' },
    });

    return {
      accounts: accounts.map((acc) => ({
        ...acc,
        user: { id: acc.user.id, name: acc.user.name, email: acc.user.email },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async freezeAccount(
    accountId: number,
    dto: FreezeAccountDto,
    adminId: number,
  ) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account['isFrozen'] = dto.isFrozen;
    await this.accountRepository.save(account);

    await this.logAudit(
      adminId,
      dto.isFrozen ? 'FREEZE_ACCOUNT' : 'UNFREEZE_ACCOUNT',
      'account',
      accountId,
      dto.reason || 'Administrative action',
    );

    return {
      message: `Account ${dto.isFrozen ? 'frozen' : 'unfrozen'} successfully`,
      account: {
        id: account.id,
        account_number: account.account_number,
        isFrozen: dto.isFrozen,
      },
    };
  }

  async closeAccount(accountId: number, dto: CloseAccountDto, adminId: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.balance > 0) {
      throw new BadRequestException(
        'Cannot close account with positive balance',
      );
    }

    account['status'] = 'CLOSED';
    account['closedAt'] = new Date();
    account['closeReason'] = dto.reason;
    await this.accountRepository.save(account);

    await this.logAudit(
      adminId,
      'CLOSE_ACCOUNT',
      'account',
      accountId,
      dto.reason,
    );

    return { message: 'Account closed successfully' };
  }

  async modifyAccountLimits(
    accountId: number,
    dto: ModifyAccountLimitDto,
    adminId: number,
  ) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account['dailyWithdrawalLimit'] =
      dto.dailyWithdrawalLimit ?? account['dailyWithdrawalLimit'];
    account['dailyTransferLimit'] =
      dto.dailyTransferLimit ?? account['dailyTransferLimit'];
    account['monthlyWithdrawalLimit'] =
      dto.monthlyWithdrawalLimit ?? account['monthlyWithdrawalLimit'];

    await this.accountRepository.save(account);

    await this.logAudit(
      adminId,
      'MODIFY_ACCOUNT_LIMITS',
      'account',
      accountId,
      JSON.stringify(dto),
    );

    return {
      message: 'Account limits updated successfully',
      limits: {
        dailyWithdrawalLimit: account['dailyWithdrawalLimit'],
        dailyTransferLimit: account['dailyTransferLimit'],
        monthlyWithdrawalLimit: account['monthlyWithdrawalLimit'],
      },
    };
  }

  // ==================== TRANSACTION MONITORING ====================

  async getAllTransactions(
    page: number = 1,
    limit: number = 100,
    status?: string,
  ) {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_account', 'from_account')
      .leftJoinAndSelect('transaction.to_account', 'to_account')
      .orderBy('transaction.created_at', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (status) {
      queryBuilder.where('transaction.status = :status', { status });
    }

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async reverseTransaction(
    transactionId: number,
    dto: ReverseTransactionDto,
    adminId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { id: transactionId },
        relations: ['from_account', 'to_account'],
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (transaction.status === TransactionStatus.REVERSED) {
        throw new BadRequestException('Transaction already reversed');
      }

      if (transaction.status === TransactionStatus.FAILED) {
        throw new BadRequestException('Cannot reverse failed transaction');
      }

      const amount = Number(transaction.amount);

      // Update account balances using direct UPDATE queries - return money to sender, take from recipient
      if (transaction.from_account) {
        const senderBalance = Number(transaction.from_account.balance);
        await queryRunner.manager.update(
          Account,
          { id: transaction.from_account.id },
          { balance: (senderBalance + amount) as any },
        );
      }

      if (transaction.to_account) {
        const receiverBalance = Number(transaction.to_account.balance);
        await queryRunner.manager.update(
          Account,
          { id: transaction.to_account.id },
          { balance: (receiverBalance - amount) as any },
        );
      }

      // Create reverse transaction record
      const reverseTransaction = queryRunner.manager.create(Transaction, {
        from_account_id: transaction.to_account?.id,
        to_account_id: transaction.from_account?.id,
        amount: transaction.amount,
        type: TransactionType.REVERSAL,
        status: TransactionStatus.COMPLETED,
        description: `Reversal of transaction #${transactionId}: ${dto.reason}`,
      });
      await queryRunner.manager.save(Transaction, reverseTransaction);

      // Update original transaction status
      transaction.status = TransactionStatus.REVERSED;
      await queryRunner.manager.save(Transaction, transaction);

      await this.logAudit(
        adminId,
        'REVERSE_TRANSACTION',
        'transaction',
        transactionId,
        dto.reason,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Transaction reversed successfully',
        reversalTransaction: reverseTransaction,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async setTransactionLimits(dto: SetTransactionLimitDto, adminId: number) {
    await this.setConfig(
      'transaction.dailyTransferLimit',
      dto.dailyTransferLimit.toString(),
    );
    await this.setConfig(
      'transaction.dailyWithdrawalLimit',
      dto.dailyWithdrawalLimit.toString(),
    );

    if (dto.perTransactionLimit) {
      await this.setConfig(
        'transaction.perTransactionLimit',
        dto.perTransactionLimit.toString(),
      );
    }

    await this.logAudit(
      adminId,
      'SET_TRANSACTION_LIMITS',
      'config',
      null,
      JSON.stringify(dto),
    );

    return { message: 'Transaction limits updated successfully', limits: dto };
  }

  async setFeeConfiguration(dto: SetFeeConfigDto, adminId: number) {
    await this.setConfig('fees.transfer', dto.transferFee.toString());
    await this.setConfig('fees.withdrawal', dto.withdrawalFee.toString());

    if (dto.monthlyMaintenanceFee !== undefined) {
      await this.setConfig(
        'fees.monthlyMaintenance',
        dto.monthlyMaintenanceFee.toString(),
      );
    }

    await this.logAudit(
      adminId,
      'SET_FEE_CONFIG',
      'config',
      null,
      JSON.stringify(dto),
    );

    return { message: 'Fee configuration updated successfully', fees: dto };
  }

  // ==================== SYSTEM CONFIGURATION ====================

  async setInterestRate(dto: SetInterestRateDto, adminId: number) {
    await this.setConfig(
      `interest.${dto.accountType}`,
      dto.interestRate.toString(),
    );

    await this.logAudit(
      adminId,
      'SET_INTEREST_RATE',
      'config',
      null,
      JSON.stringify(dto),
    );

    return { message: 'Interest rate updated successfully', config: dto };
  }

  async setLoanInterestRate(dto: SetLoanInterestRateDto, adminId: number) {
    await this.setConfig(
      `loan.interest.${dto.loanType}`,
      dto.interestRate.toString(),
    );

    await this.logAudit(
      adminId,
      'SET_LOAN_INTEREST_RATE',
      'config',
      null,
      JSON.stringify(dto),
    );

    return { message: 'Loan interest rate updated successfully', config: dto };
  }

  async setPenaltyRules(dto: SetPenaltyRulesDto, adminId: number) {
    await this.setConfig(
      'penalty.lateFeePercentage',
      dto.lateFeePercentage.toString(),
    );
    await this.setConfig('penalty.overdraftFee', dto.overdraftFee.toString());

    if (dto.minimumBalanceFee !== undefined) {
      await this.setConfig(
        'penalty.minimumBalanceFee',
        dto.minimumBalanceFee.toString(),
      );
    }

    await this.logAudit(
      adminId,
      'SET_PENALTY_RULES',
      'config',
      null,
      JSON.stringify(dto),
    );

    return { message: 'Penalty rules updated successfully', rules: dto };
  }

  async setCurrency(dto: SetCurrencyDto, adminId: number) {
    await this.setConfig('system.defaultCurrency', dto.currency);

    if (dto.exchangeRate) {
      await this.setConfig(
        `currency.${dto.currency}.rate`,
        dto.exchangeRate.toString(),
      );
    }

    await this.logAudit(
      adminId,
      'SET_CURRENCY',
      'config',
      null,
      JSON.stringify(dto),
    );

    return {
      message: 'Currency configuration updated successfully',
      config: dto,
    };
  }

  async getSystemConfiguration() {
    const configs = await this.configRepository.find();

    const configMap = {};
    configs.forEach((config) => {
      configMap[config.key] = {
        value: config.value,
        category: config.category,
        description: config.description,
        updated_at: config.updated_at,
      };
    });

    return { configurations: configMap };
  }

  // ==================== SECURITY & AUDIT ====================

  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    userId?: number,
    action?: string,
  ) {
    const queryBuilder = this.auditRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.created_at', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (userId) {
      queryBuilder.andWhere('log.user_id = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action LIKE :action', {
        action: `%${action}%`,
      });
    }

    const [logs, total] = await queryBuilder.getManyAndCount();

    return {
      logs: logs.map((log) => ({
        ...log,
        user: log.user
          ? {
              id: log.user.id,
              name: log.user.name,
              email: log.user.email,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLoginActivity(days: number = 7) {
    // This would typically query a login_attempts or sessions table
    // For now, we'll query audit logs for login actions
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.action IN (:...actions)', {
        actions: ['LOGIN_SUCCESS', 'LOGIN_FAILED'],
      })
      .andWhere('log.created_at >= :startDate', { startDate })
      .orderBy('log.created_at', 'DESC')
      .getMany();

    const summary = {
      totalLogins: logs.filter((l) => l.action === 'LOGIN_SUCCESS').length,
      failedAttempts: logs.filter((l) => l.action === 'LOGIN_FAILED').length,
      uniqueUsers: [...new Set(logs.map((l) => l.user_id))].length,
      recentActivity: logs.slice(0, 20),
    };

    return summary;
  }

  async getSuspiciousActivity() {
    // Find accounts with unusual activity
    const suspiciousTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.amount > :highAmount', { highAmount: 100000 })
      .orWhere('transaction.status = :status', { status: 'FAILED' })
      .orderBy('transaction.created_at', 'DESC')
      .take(50)
      .getMany();

    return {
      suspiciousTransactions,
      summary: {
        highValueTransactions: suspiciousTransactions.filter(
          (t) => t.amount > 100000,
        ).length,
        failedTransactions: suspiciousTransactions.filter(
          (t) => t.status === 'FAILED',
        ).length,
      },
    };
  }

  // ==================== HELPER METHODS ====================

  private async setConfig(
    key: string,
    value: string,
    category?: string,
    description?: string,
  ) {
    let config = await this.configRepository.findOne({ where: { key } });

    if (config) {
      config.value = value;
      if (category) config.category = category;
      if (description) config.description = description;
    } else {
      config = this.configRepository.create({
        key,
        value,
        category,
        description,
      });
    }

    return await this.configRepository.save(config);
  }

  // ==================== ACCOUNT DELETION MANAGEMENT ====================

  async getAllDeletionRequests(): Promise<AccountDeletionRequest[]> {
    return this.deletionRequestRepository.find({
      relations: ['account', 'user', 'processor'],
      order: { created_at: 'DESC' },
    });
  }

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

      await this.logAudit(
        adminId,
        'APPROVE_ACCOUNT_DELETION',
        'account',
        request.account_id,
        `Approved deletion of account ID ${request.account_id}`,
      );

      await queryRunner.commitTransaction();
      return request;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

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

    const saved = await this.deletionRequestRepository.save(request);

    await this.logAudit(
      adminId,
      'REJECT_ACCOUNT_DELETION',
      'account',
      request.account_id,
      `Rejected deletion of account ID ${request.account_id}: ${remarks}`,
    );

    return saved;
  }

  async getAllAccountsIncludingDeleted(): Promise<Account[]> {
    return this.accountRepository.find({
      order: { created_at: 'DESC' },
      relations: ['user'],
    });
  }

  private async logAudit(
    userId: number,
    action: string,
    resource: string,
    resourceId: number | null,
    details: string,
    ipAddress: string = '0.0.0.0',
    userAgent: string = 'Admin Panel',
  ) {
    const log = this.auditRepository.create({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return await this.auditRepository.save(log);
  }
}
