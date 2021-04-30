import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signUp')
  async signUp(@Body() createUserDto: CreateUserDto, @Res() res) {
    try {
      await this.usersService.signUp(createUserDto);
      return res.status(HttpStatus.OK).json();
    } catch (err) {
      throw new HttpException('Email already taken', HttpStatus.FORBIDDEN);
    }
  }

  @Post('singIn')
  async singIn(@Body() createUserDto: CreateUserDto, @Res() res) {
    try {
      const jwt = await this.usersService.singIn(createUserDto);
      return res.status(HttpStatus.OK).json(jwt);
    } catch (err) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }
}
