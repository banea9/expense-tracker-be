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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, role } = createUserDto;
    const newUser = new this.userModel();
    newUser.username = username;
    newUser.email = email;
    newUser.role = role;
    newUser.salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(password, newUser.salt);

    try {
      await newUser.save();
      return newUser;
    } catch (err) {
      throw new BadRequestException('Error');
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

  async getUser(id: number): Promise<User> {
    return await this.userModel.findById(id);
  }
}
