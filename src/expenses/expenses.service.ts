import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User } from 'src/users/users.schema';
import { Wallet, WalletDocument } from 'src/wallets/wallets.schema';
import { WalletsService } from 'src/wallets/wallets.service';
import { CreateExpenseDto } from './dto/CreateExpenseDto';
import { FilterUserExpenseDto } from './dto/FilterUserExpensesDto';
import { Expense, ExpenseDocument } from './expenses.schema';
@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    private walletService: WalletsService,
  ) {}

  //fetch expenses by user and wallet
  async getLatestExpenses(user: User): Promise<Expense[]> {
    return await this.expenseModel
      .find({
        user,
        wallet: user.activeWallet,
      })
      .sort({ lastModified: -1 })
      .limit(5);
  }

  async getExpenses(user: User): Promise<Expense[]> {
    return await this.expenseModel.find({ user, wallet: user.activeWallet });
  }

  //create expense
  async createExpense(
    user: User,
    createExpenseDto: CreateExpenseDto,
    session: ClientSession,
  ): Promise<Expense> {
    const { wallet } = createExpenseDto;
    const fetchedWallet = await this.walletModel
      .findOne({ name: wallet.name })
      .session(session)
      .exec();

    let expense;
    const transaction = await this.expenseModel.db.startSession();
    try {
      await transaction.withTransaction(async () => {
        expense = new this.expenseModel({
          ...createExpenseDto,
          wallet: fetchedWallet,
          user,
          lastModified: new Date(),
        });

        await expense.save({ session });
        fetchedWallet.expenses.push(expense._id);

        await fetchedWallet.save({ session });
      });

      await transaction.commitTransaction();
    } catch (err) {
      await transaction.abortTransaction();
      throw err;
    } finally {
      transaction.endSession();
      return expense;
    }
  }

  //delete expense
  async deleteExpense(id: number): Promise<Expense> {
    return await this.expenseModel.findByIdAndRemove(id);
  }

  //filter expense
  async filterUserExpense(
    user: User,
    filterUserExpenseDto: FilterUserExpenseDto,
  ): Promise<Expense[]> {
    const { fromDate, toDate, wallet } = filterUserExpenseDto;
    const fetchedWallet = await this.walletService.getWalletByName(
      wallet?.name,
    );

    if (wallet?.name && !fetchedWallet) {
      return [];
    }

    const endDate = new Date(toDate).setHours(23, 59, 59);
    const query = {
      user,
      lastModified: {
        $gte: new Date(fromDate),
        $lte: endDate,
      },
    };
    if (wallet?.name && fetchedWallet) query['wallet'] = fetchedWallet;

    return await this.expenseModel.find(query);
  }
}
