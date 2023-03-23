import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from './expenses.schema';
import { WalletsModule } from 'src/wallets/wallets.module';
import { Wallet, WalletSchema } from 'src/wallets/wallets.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    WalletsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
