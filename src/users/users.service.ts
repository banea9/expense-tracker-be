import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUserDto';
import { User, UserDocument } from './users.schema';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto/SignInUserDto';
import { JwtService } from '@nestjs/jwt';
import { IUser } from './interface/user.interface';
import { ResetPasswordDto } from './dto/ResetPasswordDto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, confirmPassword, role } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords must match');
    }

    const newUser = new this.userModel();
    newUser.username = username;
    newUser.email = email;
    newUser.role = role;
    newUser.salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, newUser.salt);
    newUser.password = hashedPassword;
    newUser.confirmPassword = hashedPassword;

    try {
      await newUser.save();
      return newUser;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async createToken(signInUserDto: SignInUserDto): Promise<string> {
    const { email, password } = signInUserDto;
    const user = await this.userModel.findOne({ email });
    const hash = await bcrypt.hash(password, user.salt);

    if (!user || hash !== user.password)
      throw new UnauthorizedException('Invalid Credentials');

    const payload = {
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.sign(payload);
    return token;
  }

  async getUser(id: number): Promise<IUser> {
    const user = await this.userModel.findById(id);
    const { username, email } = user;
    return { username, email };
  }

  async editUser(id: number, usernameParam: string): Promise<IUser> {
    const user = await this.userModel.findById(id);
    user.username = usernameParam;
    const { username, email } = user;
    return { username, email };
  }

  async resetPassword(
    id: number,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    const { currentPassword, newPassword, confirmPassword } = resetPasswordDto;
    const user = await this.userModel.findById(id);
    const hash = await bcrypt.hash(currentPassword, user.salt);
    const newPasswordHash = await bcrypt.hash(newPassword, user.salt);

    if (user.password !== hash || newPassword !== confirmPassword) {
      throw new BadRequestException(
        'Error occured. Please make sure that the current password is correct and that new password and current password are matching',
      );
    }

    user.password = newPasswordHash;

    await user.save();

    return true;
  }
}
