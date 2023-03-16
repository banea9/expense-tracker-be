/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Expense } from 'src/expenses/expenses.schema';
import { User } from 'src/users/users.schema';

export type WalletDocument = mongoose.HydratedDocument<Wallet>;

@Schema()
export class Wallet {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  creatorEmail: string;
  
  @Prop({ required: true })
  lastModified: Date;
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  users: User;
  
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }] })
  expenses: Expense[];
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);