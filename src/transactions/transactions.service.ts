import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { DepositRequest } from './entities/deposit-request.entity';
import { Account } from '@/accounts/entities/account.entity';
import { User } from '@/users/entities/user.entity';
import { DepositDto, WithdrawDto, TransferDto } from './dto/transaction.dto';
import { AddBeneficiaryDto, UpdateBeneficiaryDto } from './dto/beneficiary.dto';
import {
  CreateDepositRequestDto,
  ApproveDepositRequestDto,
  RejectDepositRequestDto,
} from './dto/deposit-request.dto';
import { TransactionType, TransactionStatus } from '@/common/enums';
import { NotificationsService } from '@/notifications/notifications.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Beneficiary)
    private beneficiaryRepository: Repository<Beneficiary>,
    @InjectRepository(DepositRequest)
    private depositRequestRepository: Repository<DepositRequest>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private notificationsService: NotificationsService,
  ) {}

  // Old direct deposit method - now disabled for users
  // Admin will use approveDepositRequest instead
  async deposit(depositDto: DepositDto, userId: number): Promise<Transaction> {
    throw new BadRequestException(
      'Direct deposits are not allowed. Please create a deposit request for admin approval.',
    );
  }

  // Create deposit request (users can only request, not directly deposit)
  async createDepositRequest(
    createDepositRequestDto: CreateDepositRequestDto,
    userId: number,
  ): Promise<DepositRequest> {
    // Find account
    const account = await this.accountRepository.findOne({
      where: { id: createDepositRequestDto.accountId, user_id: userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Create deposit request
    const depositRequest = this.depositRequestRepository.create({
      user_id: userId,
      account_id: createDepositRequestDto.accountId,
      amount: createDepositRequestDto.amount,
      description: createDepositRequestDto.description || 'Deposit request',
      status: TransactionStatus.PENDING,
    });

    return this.depositRequestRepository.save(depositRequest);
  }

  // Get all deposit requests (admin view)
  async getAllDepositRequests(): Promise<DepositRequest[]> {
    return this.depositRequestRepository.find({
      relations: ['user', 'account', 'admin'],
      order: { created_at: 'DESC' },
    });
  }

  // Get user's deposit requests
  async getUserDepositRequests(userId: number): Promise<DepositRequest[]> {
    return this.depositRequestRepository.find({
      where: { user_id: userId },
      relations: ['account', 'admin'],
      order: { created_at: 'DESC' },
    });
  }

  // Approve deposit request (admin only)
  async approveDepositRequest(
    requestId: number,
    adminId: number,
    approveDto: ApproveDepositRequestDto,
  ): Promise<DepositRequest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find deposit request
      const depositRequest = await queryRunner.manager.findOne(DepositRequest, {
        where: { id: requestId },
        relations: ['account', 'user'],
      });

      if (!depositRequest) {
        throw new NotFoundException('Deposit request not found');
      }

      if (depositRequest.status !== TransactionStatus.PENDING) {
        throw new BadRequestException(
          'Deposit request has already been processed',
        );
      }

      // Check if account is frozen
      const account = depositRequest.account;
      if (account.isFrozen) {
        throw new BadRequestException(
          'Cannot approve deposit for a frozen account. Please unfreeze the account first.',
        );
      }

      // Update account balance using direct UPDATE query
      const currentBalance = Number(account.balance);
      const depositAmount = Number(depositRequest.amount);
      await queryRunner.manager.update(
        Account,
        { id: account.id },
        { balance: (currentBalance + depositAmount) as any },
      );

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        to_account_id: depositRequest.account_id,
        amount: depositRequest.amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: depositRequest.description || 'Deposit - Admin Approved',
      });
      await queryRunner.manager.save(Transaction, transaction);

      // Update deposit request
      depositRequest.status = TransactionStatus.COMPLETED;
      depositRequest.approved_by = adminId;
      depositRequest.admin_remarks = approveDto.remarks || 'Approved';
      depositRequest.processed_at = new Date();
      const updatedRequest = await queryRunner.manager.save(
        DepositRequest,
        depositRequest,
      );

      await queryRunner.commitTransaction();

      // Notify user about approved deposit
      if (depositRequest.user) {
        this.notificationsService
          .sendTransactionNotification(
            depositRequest.user_id,
            depositRequest.user.email,
            depositRequest.user.name,
            'Deposit',
            Number(depositRequest.amount),
            account.account_number,
          )
          .catch(() => {});
      }

      return updatedRequest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Reject deposit request (admin only)
  async rejectDepositRequest(
    requestId: number,
    adminId: number,
    rejectDto: RejectDepositRequestDto,
  ): Promise<DepositRequest> {
    const depositRequest = await this.depositRequestRepository.findOne({
      where: { id: requestId },
      relations: ['user', 'account'],
    });

    if (!depositRequest) {
      throw new NotFoundException('Deposit request not found');
    }

    if (depositRequest.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Deposit request has already been processed',
      );
    }

    depositRequest.status = TransactionStatus.FAILED;
    depositRequest.approved_by = adminId;
    depositRequest.admin_remarks = rejectDto.remarks;
    depositRequest.processed_at = new Date();

    const saved = await this.depositRequestRepository.save(depositRequest);

    // Notify user about rejected deposit
    if (depositRequest.user) {
      this.notificationsService
        .sendAccountNotification(
          depositRequest.user_id,
          depositRequest.user.email,
          depositRequest.user.name,
          'Deposit Request Rejected',
          depositRequest.account?.account_number ?? '',
        )
        .catch(() => {});
    }

    return saved;
  }

  async withdraw(
    withdrawDto: WithdrawDto,
    userId: number,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find account
      const account = await queryRunner.manager.findOne(Account, {
        where: { id: withdrawDto.accountId, user_id: userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Check if account is frozen
      if (account.isFrozen) {
        throw new BadRequestException(
          'Account is frozen. Please contact support.',
        );
      }

      // Check balance
      const currentBalance = Number(account.balance);
      const withdrawAmount = Number(withdrawDto.amount);

      if (currentBalance < withdrawAmount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Update balance using direct UPDATE query
      await queryRunner.manager.update(
        Account,
        { id: account.id },
        { balance: (currentBalance - withdrawAmount) as any },
      );

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        from_account_id: withdrawDto.accountId,
        amount: withdrawDto.amount,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.COMPLETED,
        description: withdrawDto.description || 'Withdrawal',
      });

      const savedTransaction = await queryRunner.manager.save(
        Transaction,
        transaction,
      );

      await queryRunner.commitTransaction();

      // Notify user about withdrawal
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        this.notificationsService
          .sendTransactionNotification(
            userId,
            user.email,
            user.name,
            'Withdrawal',
            Number(withdrawDto.amount),
            account.account_number,
          )
          .catch(() => {});
      }

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(
    transferDto: TransferDto,
    userId: number,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find sender account
      const fromAccount = await queryRunner.manager.findOne(Account, {
        where: {
          account_number: transferDto.fromAccountNumber,
          user_id: userId,
        },
      });

      if (!fromAccount) {
        throw new NotFoundException('Sender account not found');
      }

      if (fromAccount.isFrozen) {
        throw new BadRequestException(
          'Sender account is frozen. Please contact support.',
        );
      }

      const senderBalance = Number(fromAccount.balance);
      const transferAmount = Number(transferDto.amount);

      if (senderBalance < transferAmount) {
        throw new BadRequestException('Insufficient balance');
      }

      // ── External transfer ──────────────────────────────────────────
      if (transferDto.isExternal) {
        if (
          !transferDto.externalBankName ||
          !transferDto.externalAccountNumber
        ) {
          throw new BadRequestException(
            'External bank name and account number are required for external transfers',
          );
        }

        // Debit sender only
        await queryRunner.manager.update(
          Account,
          { id: fromAccount.id },
          { balance: (senderBalance - transferAmount) as any },
        );

        const transaction = queryRunner.manager.create(Transaction, {
          from_account_id: fromAccount.id,
          to_account_id: null,
          amount: transferDto.amount,
          type: TransactionType.EXTERNAL_TRANSFER,
          status: TransactionStatus.COMPLETED,
          description:
            transferDto.description ||
            `External transfer to ${transferDto.externalBankName}`,
          transfer_type: 'EXTERNAL',
          external_bank_name: transferDto.externalBankName,
          external_account_number: transferDto.externalAccountNumber,
          external_beneficiary_name:
            transferDto.externalBeneficiaryName || null,
          external_ifsc_code: transferDto.externalIfscCode || null,
        });

        const saved = await queryRunner.manager.save(Transaction, transaction);
        await queryRunner.commitTransaction();

        // Notify sender about external transfer
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });
        if (user) {
          this.notificationsService
            .sendTransactionNotification(
              userId,
              user.email,
              user.name,
              'External Transfer',
              Number(transferDto.amount),
              fromAccount.account_number,
            )
            .catch(() => {});
        }

        return saved;
      }

      // ── Internal transfer ──────────────────────────────────────────
      if (!transferDto.toAccountNumber) {
        throw new BadRequestException(
          'Recipient account number is required for internal transfers',
        );
      }

      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { account_number: transferDto.toAccountNumber },
      });

      if (!toAccount) {
        throw new NotFoundException('Receiver account not found');
      }

      if (transferDto.fromAccountNumber === transferDto.toAccountNumber) {
        throw new BadRequestException('Cannot transfer to the same account');
      }

      const receiverBalance = Number(toAccount.balance);

      await queryRunner.manager.update(
        Account,
        { id: fromAccount.id },
        { balance: (senderBalance - transferAmount) as any },
      );

      await queryRunner.manager.update(
        Account,
        { id: toAccount.id },
        { balance: (receiverBalance + transferAmount) as any },
      );

      const transaction = queryRunner.manager.create(Transaction, {
        from_account_id: fromAccount.id,
        to_account_id: toAccount.id,
        amount: transferDto.amount,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        description: transferDto.description || 'Internal Transfer',
        transfer_type: 'INTERNAL',
      });

      const saved = await queryRunner.manager.save(Transaction, transaction);
      await queryRunner.commitTransaction();

      // Notify sender about internal transfer
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        this.notificationsService
          .sendTransactionNotification(
            userId,
            user.email,
            user.name,
            'Transfer',
            Number(transferDto.amount),
            fromAccount.account_number,
          )
          .catch(() => {});
      }

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validateAccountNumber(accountNumber: string) {
    const account = await this.accountRepository.findOne({
      where: { account_number: accountNumber },
      relations: ['user'],
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return {
      found: true,
      account_number: account.account_number,
      account_type: account.account_type,
      holder: account.user?.name ?? 'Unknown',
    };
  }

  async getTransactionHistory(
    userId: number,
    accountId?: number,
  ): Promise<Transaction[]> {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.from_account', 'from_account')
      .leftJoinAndSelect('transaction.to_account', 'to_account')
      .where('from_account.user_id = :userId', { userId })
      .orWhere('to_account.user_id = :userId', { userId });

    if (accountId) {
      query.andWhere(
        '(transaction.from_account_id = :accountId OR transaction.to_account_id = :accountId)',
        { accountId },
      );
    }

    return query.orderBy('transaction.created_at', 'DESC').getMany();
  }

  // Beneficiary Management
  async addBeneficiary(
    addBeneficiaryDto: AddBeneficiaryDto,
    userId: number,
  ): Promise<Beneficiary> {
    // Check if beneficiary already exists for this user
    const existing = await this.beneficiaryRepository.findOne({
      where: {
        user_id: userId,
        account_number: addBeneficiaryDto.account_number,
      },
    });

    if (existing) {
      throw new BadRequestException('Beneficiary already exists');
    }

    const beneficiary = this.beneficiaryRepository.create({
      ...addBeneficiaryDto,
      user_id: userId,
    });

    return this.beneficiaryRepository.save(beneficiary);
  }

  async getBeneficiaries(userId: number): Promise<Beneficiary[]> {
    return this.beneficiaryRepository.find({
      where: { user_id: userId, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async getBeneficiaryById(
    beneficiaryId: number,
    userId: number,
  ): Promise<Beneficiary> {
    const beneficiary = await this.beneficiaryRepository.findOne({
      where: { id: beneficiaryId, user_id: userId },
    });

    if (!beneficiary) {
      throw new NotFoundException('Beneficiary not found');
    }

    return beneficiary;
  }

  async updateBeneficiary(
    beneficiaryId: number,
    updateBeneficiaryDto: UpdateBeneficiaryDto,
    userId: number,
  ): Promise<Beneficiary> {
    const beneficiary = await this.getBeneficiaryById(beneficiaryId, userId);

    Object.assign(beneficiary, updateBeneficiaryDto);

    return this.beneficiaryRepository.save(beneficiary);
  }

  async deleteBeneficiary(
    beneficiaryId: number,
    userId: number,
  ): Promise<void> {
    const beneficiary = await this.getBeneficiaryById(beneficiaryId, userId);

    // Soft delete - mark as inactive instead of deleting
    beneficiary.is_active = false;
    await this.beneficiaryRepository.save(beneficiary);
  }
}
