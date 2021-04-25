import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('SignUp')
  SignUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.SignUp(createUserDto);
  }

  @Post('SingIn')
  SingIn(@Body() createUserDto: CreateUserDto) {
    return this.usersService.SingIn(createUserDto);
  }
}
