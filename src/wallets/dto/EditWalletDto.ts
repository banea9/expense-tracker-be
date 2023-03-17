/* eslint-disable prettier/prettier */
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EditWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
  
  @IsEmail()
  @IsNotEmpty()
  creatorEmail: string;
  
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
