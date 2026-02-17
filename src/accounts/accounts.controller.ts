import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/account.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Post()
  create(
    @GetUser('userId') userId: number,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(userId, createAccountDto);
  }

  @Get()
  findAll(@GetUser('userId') userId: number) {
    return this.accountsService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.accountsService.findOne(+id, userId);
  }
}
