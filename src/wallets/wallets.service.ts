import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { User, UserDocument } from 'src/users/users.schema';
import { CreateWalletDto } from './dto/CreateWalletDto';
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
}
