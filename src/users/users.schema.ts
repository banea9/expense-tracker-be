/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Wallet } from 'src/wallets/wallets.schema';
import * as mongoose from 'mongoose';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  confirmPassword: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ default: null })
  role: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', default: null })
  activeWallet: Wallet;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' }] })
  wallets: Wallet[];
}

export const UserSchema = SchemaFactory.createForClass(User);


