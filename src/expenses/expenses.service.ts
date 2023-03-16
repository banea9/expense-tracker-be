import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/users.schema';
import { WalletsService } from 'src/wallets/wallets.service';
import { CreateExpenseDto } from './dto/CreateExpenseDto';
import { FilterUserExpenseDto } from './dto/FilterUserExpensesDto';
import { Expense, ExpenseDocument } from './expenses.schema';
@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
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
  ): Promise<Expense> {
    const { wallet } = createExpenseDto;
    const fetchedWallet = await this.walletService.getWalletByName(wallet.name);
    console.log(fetchedWallet);
    const newExpense = new this.expenseModel({
      ...createExpenseDto,
      wallet: fetchedWallet,
      user,
      lastModified: new Date(),
    });

    try {
      return await newExpense.save();
    } catch (err) {
      console.log(err);
      throw new BadRequestException(
        'Error happened while creating a new expense.',
      );
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