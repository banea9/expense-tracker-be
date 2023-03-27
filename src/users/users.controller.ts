import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { SignInUserDto } from './dto/SignInUserDto';
import { IUser } from './interface/user.interface';
import { JwtAuthGuard } from './jwt-auth-guard';
import { User } from './users.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('')
  async signIn(@Body() signInUserDto: SignInUserDto): Promise<string> {
    return await this.usersService.createToken(signInUserDto);
  }

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(@Param('id') id: number): Promise<IUser> {
    return await this.usersService.getUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/edit')
  async editUser(
    @Param('id') id: number,
    @Body('username') username: string,
  ): Promise<IUser> {
    return await this.usersService.editUser(id, username);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/resetPassword')
  async resetPassword(
    @Param('id') id: number,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    return await this.usersService.resetPassword(id, resetPasswordDto);
  }
}
