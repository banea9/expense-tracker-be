import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';
import { SignInUserDto } from './dto/SignInUserDto';
import { User } from './users.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('')
  async signIn(@Body() signInUserDto: SignInUserDto): Promise<string> {
    console.log(signInUserDto);
    return await this.usersService.createToken(signInUserDto);
  }

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserDto);
  }

  @Get(':id')
  async getUser(@Param('id') id: number): Promise<User> {
    return await this.usersService.getUser(id);
  }
}
