import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '@/accounts/entities/account.entity';
import { Transaction } from '@/transactions/entities/transaction.entity';
import {
  AccountType,
  TransactionType,
  TransactionStatus,
} from '@/common/enums';

@Injectable()
export class InterestService {
  private readonly logger = new Logger(InterestService.name);

  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Calculate and apply interest on the 1st day of every month
   * Interest rate: 4% annual for savings accounts (0.33% monthly)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlyInterest() {
    this.logger.log('Starting monthly interest calculation...');

    try {
      // Get all savings accounts
      const savingsAccounts = await this.accountRepository.find({
        where: { account_type: AccountType.SAVINGS },
      });

      const annualRate = 4; // 4% annual interest
      const monthlyRate = annualRate / 12 / 100; // 0.0033 (0.33% monthly)

      for (const account of savingsAccounts) {
        const currentBalance = Number(account.balance);
        const interestAmount =
          Math.round(currentBalance * monthlyRate * 100) / 100;

        if (interestAmount > 0) {
          // Update account balance
          account.balance = currentBalance + interestAmount;
          await this.accountRepository.save(account);

          // Create transaction record
          const transaction = this.transactionRepository.create({
            to_account_id: account.id,
            amount: interestAmount,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.COMPLETED,
            description: `Monthly interest credit (${monthlyRate * 100}%)`,
          });

          await this.transactionRepository.save(transaction);

          this.logger.log(
            `Interest applied to account ${account.account_number}: $${interestAmount}`,
          );
        }
      }

      this.logger.log(
        `Successfully applied interest to ${savingsAccounts.length} accounts`,
      );
    } catch (error) {
      this.logger.error('Error applying monthly interest:', error);
    }
  }

  /**
   * Manual trigger for interest calculation (for testing)
   */
  async applyInterestManually(): Promise<{
    message: string;
    accountsProcessed: number;
  }> {
    this.logger.log('Manually triggering interest calculation...');

    const savingsAccounts = await this.accountRepository.find({
      where: { account_type: AccountType.SAVINGS },
    });

    const annualRate = 4;
    const monthlyRate = annualRate / 12 / 100;
    let processed = 0;

    for (const account of savingsAccounts) {
      const currentBalance = Number(account.balance);
      const interestAmount =
        Math.round(currentBalance * monthlyRate * 100) / 100;

      if (interestAmount > 0) {
        account.balance = currentBalance + interestAmount;
        await this.accountRepository.save(account);

        const transaction = this.transactionRepository.create({
          to_account_id: account.id,
          amount: interestAmount,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
          description: `Interest credit (Manual)`,
        });

        await this.transactionRepository.save(transaction);
        processed++;
      }
    }

    return {
      message: 'Interest calculation completed',
      accountsProcessed: processed,
    };
  }

  /**
   * Get interest summary for an account
   */
  async getInterestSummary(accountId: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get all interest transactions
    const interestTransactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.to_account_id = :accountId', { accountId })
      .andWhere('transaction.description LIKE :pattern', {
        pattern: '%interest%',
      })
      .orderBy('transaction.created_at', 'DESC')
      .getMany();

    const totalInterestEarned = interestTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    return {
      account_number: account.account_number,
      account_type: account.account_type,
      current_balance: account.balance,
      total_interest_earned: Math.round(totalInterestEarned * 100) / 100,
      interest_transactions: interestTransactions,
    };
  }
}
