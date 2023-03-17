import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { User, UserDocument } from 'src/users/users.schema';
import { CreateWalletDto } from './dto/CreateWalletDto';
import { EditWalletDto } from './dto/EditWalletDto';
import { Wallet, WalletDocument } from './wallets.schema';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getWallets(): Promise<Wallet[]> {
    return await this.walletModel.find();
  }

  async getWalletByName(name: string): Promise<Wallet> {
    return this.walletModel.findOne({ name });
  }

  async getWalletById(id: number): Promise<Wallet> {
    return this.walletModel.findById(id);
  }

  async createWallet(
    userParam: User,
    createWalletDto: CreateWalletDto,
    session: ClientSession,
  ): Promise<any> {
    const user = await this.userModel
      .findOne({ email: userParam.email })
      .session(session)
      .populate('wallets')
      .exec();
    const transaction = await this.walletModel.db.startSession();
    let wallet;
    try {
      await transaction.withTransaction(async () => {
        wallet = new this.walletModel({
          ...createWalletDto,
          lastModified: new Date(),
        });
        wallet.users.push(user);
        await wallet.save({ session });

        user.wallets.push(wallet);

        if (!user.activeWallet) {
          user.activeWallet = wallet;
        }

        await user.save({ session });
      });

      await transaction.commitTransaction();
    } catch (err) {
      await transaction.abortTransaction();
      throw err;
    } finally {
      transaction.endSession();
      return wallet;
    }
  }

  async editWallet(
    userParam: User,
    editWalletDto: EditWalletDto,
    id: number,
    session: ClientSession,
  ): Promise<Wallet> {
    const user = await this.userModel
      .findOne({ email: userParam.email })
      .session(session)
      .exec();
    const transaction = await this.walletModel.db.startSession();
    let wallet;
    try {
      await transaction.withTransaction(async () => {
        wallet = await this.walletModel.findById(id);
        if (wallet.creatorEmail !== user.email)
          throw new BadRequestException(
            'Wallet can be edited only it the user who created it.',
          );
        const { name, description, isActive } = editWalletDto;
        const isWalletNameUsed = await this.walletModel.findOne({ name });
        if (isWalletNameUsed) {
          throw new BadRequestException(
            'Wallet name must be unique. Please choose another name',
          );
        }

        wallet.name = name;
        wallet.description = description;
        await wallet.save({ session });

        if (isActive) {
          user.activeWallet = wallet;
          await user.save({ session });
        }
      });
      await transaction.commitTransaction();
    } catch (err) {
      await transaction.abortTransaction();
      throw err;
    } finally {
      transaction.endSession();
      return wallet;
    }
  }
}
