import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { GetUser } from 'src/users/get-user';
import { JwtAuthGuard } from 'src/users/jwt-auth-guard';
import { User } from 'src/users/users.schema';
import { CreateExpenseDto } from './dto/CreateExpenseDto';
import { FilterUserExpenseDto } from './dto/FilterUserExpensesDto';
import { Expense } from './expenses.schema';
import { ExpensesService } from './expenses.service';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesServices: ExpensesService) {}

  @Get('')
  async getLatestExpenses(@GetUser() user: User): Promise<Expense[]> {
    return await this.expensesServices.getLatestExpenses(user);
  }

  @Get('all')
  async getExpenses(@GetUser() user: User): Promise<Expense[]> {
    return await this.expensesServices.getExpenses(user);
  }

  @Post()
  async createExpense(
    @GetUser() user: User,
    @Body() createExpenseDto: CreateExpenseDto,
    session: ClientSession,
  ): Promise<Expense> {
    return await this.expensesServices.createExpense(
      user,
      createExpenseDto,
      session,
    );
  }

  @Delete(':id/delete')
  //delete expense
  async deleteExpense(
    @Param('id') id: number,
    @GetUser() userParam: User,
    session: ClientSession,
  ): Promise<Expense> {
    return await this.expensesServices.deleteExpense(id, userParam, session);
  }

  @Get('filter')
  //filter expense
  async filterUserExpense(
    @GetUser() user: User,
    @Body() filterUserExpenseDto: FilterUserExpenseDto,
  ): Promise<Expense[]> {
    return await this.expensesServices.filterUserExpense(
      user,
      filterUserExpenseDto,
    );
  }
}
