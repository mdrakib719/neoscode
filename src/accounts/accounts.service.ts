import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/account.dto';
import * as crypto from 'crypto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
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
      where: { user_id: userId },
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
}
