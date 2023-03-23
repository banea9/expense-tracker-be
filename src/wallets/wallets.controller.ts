import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Wallet } from './wallets.schema';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/CreateWalletDto';
import { EditWalletDto } from './dto/EditWalletDto';
import { GetUser } from 'src/users/get-user';
import { User } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/users/jwt-auth-guard';
import { ClientSession } from 'mongoose';
import { UpdateWalletUser } from './dto/UpdateWalletUser';

@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private walletService: WalletsService) {}

  @Get('user')
  async getUserWallet(@GetUser() user: User): Promise<Wallet[]> {
    return this.walletService.getUserWallets(user);
  }

  @Get('')
  async getAllWallets(): Promise<Wallet[]> {
    return await this.walletService.getWallets();
  }

  @Get(':id')
  async getWallet(@Param('id') id: number): Promise<Wallet> {
    return this.walletService.getWalletById(id);
  }

  @Post('')
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

  @Patch(':id/addUser')
  async addUserToWallet(
    @Param('id') walletId: number,
    @GetUser() user: User,
    @Body() updateWalletUser: UpdateWalletUser,
    session: ClientSession,
  ): Promise<boolean> {
    return this.walletService.addUserToWallet(
      walletId,
      user,
      updateWalletUser,
      session,
    );
  }

  @Patch(':id/removeUser')
  async removeUserFromWallet(
    @Param('id') walletId: number,
    @GetUser() user: User,
    @Body() updateWalletUser: UpdateWalletUser,
    session: ClientSession,
  ): Promise<boolean> {
    return this.walletService.removeUserFromWallet(
      walletId,
      user,
      updateWalletUser,
      session,
    );
  }

  @Patch(':id')
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
