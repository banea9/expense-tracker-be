/* eslint-disable prettier/prettier */
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';
import { Wallet } from 'src/wallets/wallets.schema';

export class FilterUserExpenseDto {
  @IsNotEmpty()
  @IsDate()
  fromDate: Date;

  @IsNotEmpty()
  @IsDate()
  toDate: Date;

  @IsOptional()
  allUsers: boolean;

  @IsOptional()
  wallet: Wallet;

  @IsOptional()
  allWallets: boolean;

  @IsOptional()
  category: string;

  @IsOptional()
  subcategory: string;

  @IsNotEmpty()
  sortColumn: string;

  @IsNotEmpty()
  sortOrder: string;
}
