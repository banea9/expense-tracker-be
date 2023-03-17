import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { Wallet } from './wallets.schema';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/CreateWalletDto';
import { EditWalletDto } from './dto/EditWalletDto';
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

  @Get(':id')
  async getWallet(@Param('id') id: number): Promise<Wallet> {
    return this.walletService.getWalletById(id);
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

  @Post(':id')
  async editWallet(
    @GetUser() user,
    @Body() editWalletDto: EditWalletDto,
    @Param('id') id: number,
    session: ClientSession,
  ): Promise<Wallet> {
    return await this.walletService.editWallet(
      user,
      editWalletDto,
      id,
      session,
    );
  }
}
