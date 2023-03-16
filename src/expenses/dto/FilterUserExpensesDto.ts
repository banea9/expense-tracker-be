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
  wallet: Wallet;
}
