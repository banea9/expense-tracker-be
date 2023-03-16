import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Wallet } from './wallets.schema';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/CreateWalletDto';
import { GetUser } from 'src/users/get-user';
import { User } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/users/jwt-auth-guard';
import { ClientSession } from 'mongoose';
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private walletService: WalletsService) {}
  @Get()
  async getAllWallets(): Promise<Wallet[]> {
    return await this.walletService.getWallets();
  }

  @Post()
  async createWallet(
    @GetUser() user: User,
    @Body() createWalletDto: CreateWalletDto,
    session: ClientSession,
  ): Promise<Wallet> {
    return await this.walletService.createWallet(
      user,
      createWalletDto,
      session,
    );
  }
}
