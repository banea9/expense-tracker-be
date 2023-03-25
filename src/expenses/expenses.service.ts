import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/users.schema';
import { Wallet, WalletDocument } from 'src/wallets/wallets.schema';
import { CreateExpenseDto } from './dto/CreateExpenseDto';
import { FilterUserExpenseDto } from './dto/FilterUserExpensesDto';
import { Expense, ExpenseDocument } from './expenses.schema';
@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
  async deleteExpense(
    id: number,
    userParam: User,
    session: ClientSession,
  ): Promise<Expense> {
    const transaction = await this.expenseModel.db.startSession();
    let expense;

    try {
      await transaction.withTransaction(async () => {
        expense = await this.expenseModel
          .findById(id)
          .populate('user')
          .session(session);
        const wallet = await this.walletModel
          .findOne({
            expenses: { $elemMatch: { $eq: expense } },
          })
          .session(session);
        const user = await this.userModel
          .findOne({ email: userParam.email })
          .session(session);
        const expenseUser = await this.userModel.findOne({
          email: expense.user.email,
        });

        if (
          user.email !== expenseUser.email &&
          user.email !== wallet.creatorEmail
        )
          throw new BadRequestException(
            'Users can only delete their own expenses.',
          );

        await expense.delete({ session });

        await this.walletModel.findOneAndUpdate(
          { _id: wallet._id },
          { $pull: { expenses: expense._id } },
          { session },
        );
      });

      await transaction.commitTransaction();
    } catch (err) {
      console.log(err);
      await transaction.abortTransaction();
      throw err;
    } finally {
      transaction.endSession();
      return expense;
    }
  }

  //filter expense
  async filterUserExpense(
    user: User,
    filterUserExpenseDto: FilterUserExpenseDto,
  ): Promise<Expense[]> {
    const { fromDate, toDate, wallet } = filterUserExpenseDto;
    const fetchedWallet = await this.walletModel.findOne({
      name: wallet?.name,
    });

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
