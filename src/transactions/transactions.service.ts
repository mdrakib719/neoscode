import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Account } from '@/accounts/entities/account.entity';
import { DepositDto, WithdrawDto, TransferDto } from './dto/transaction.dto';
import { TransactionType, TransactionStatus } from '@/common/enums';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  async deposit(depositDto: DepositDto, userId: number): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find account
      const account = await queryRunner.manager.findOne(Account, {
        where: { id: depositDto.accountId, user_id: userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Update balance
      account.balance = Number(account.balance) + depositDto.amount;
      await queryRunner.manager.save(Account, account);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        to_account_id: depositDto.accountId,
        amount: depositDto.amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        description: depositDto.description || 'Deposit',
      });

      const savedTransaction = await queryRunner.manager.save(
        Transaction,
        transaction,
      );

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

      // Check balance
      if (Number(account.balance) < withdrawDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Update balance
      account.balance = Number(account.balance) - withdrawDto.amount;
      await queryRunner.manager.save(Account, account);

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
        where: { id: transferDto.fromAccountId, user_id: userId },
      });

      if (!fromAccount) {
        throw new NotFoundException('Sender account not found');
      }

      // Find receiver account
      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { id: transferDto.toAccountId },
      });

      if (!toAccount) {
        throw new NotFoundException('Receiver account not found');
      }

      // Check if same account
      if (transferDto.fromAccountId === transferDto.toAccountId) {
        throw new BadRequestException('Cannot transfer to the same account');
      }

      // Check balance
      if (Number(fromAccount.balance) < transferDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Deduct from sender
      fromAccount.balance = Number(fromAccount.balance) - transferDto.amount;
      await queryRunner.manager.save(Account, fromAccount);

      // Add to receiver
      toAccount.balance = Number(toAccount.balance) + transferDto.amount;
      await queryRunner.manager.save(Account, toAccount);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        from_account_id: transferDto.fromAccountId,
        to_account_id: transferDto.toAccountId,
        amount: transferDto.amount,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        description: transferDto.description || 'Transfer',
      });

      const savedTransaction = await queryRunner.manager.save(
        Transaction,
        transaction,
      );

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
}
