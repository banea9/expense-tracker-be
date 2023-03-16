/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Wallet } from 'src/wallets/wallets.schema';

export type ExpenseDocument = mongoose.HydratedDocument<Expense>;

@Schema()
export class Expense {
  @Prop({ required: true })
  category: string;
  
  @Prop({ required: true })
  subcategory: string;
  
  @Prop({ required: true })
  amount: string;
  
  @Prop({ required: true })
  lastModified: Date;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' })
  wallet: Wallet;
}


export const ExpenseSchema = SchemaFactory.createForClass(Expense);
