/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateWalletUser {
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;
}
