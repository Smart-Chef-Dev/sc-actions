import {
  Controller,
  Get,
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
    await this.usersService.signUp(createUserDto).catch(() => {
      throw new HttpException('Email already taken', HttpStatus.FORBIDDEN);
    });

    return res.status(HttpStatus.OK).json();
  }

  @Post('singIn')
  async singIn(@Body() createUserDto: CreateUserDto, @Res() res) {
    const jwt = await this.usersService.singIn(createUserDto).catch((err) => {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND);
    });

    return res.status(HttpStatus.OK).json(jwt);
  }
}
