import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  async signUp(@Body() dto: CreateUserDto) {
    const isEmailExists = await this.usersService.findByEmail(dto.email);

    if (isEmailExists) {
      throw new ForbiddenException('Email is already taken');
    }

    return this.usersService.signUp(dto);
  }

  @Post('sing-in')
  async singIn(@Body() dto: CreateUserDto) {
    const user = await this.usersService.findByEmail(dto.email);
    const isPasswordMatches = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatches) {
      throw new NotFoundException('Wrong login or password');
    }

    return this.usersService.singIn(dto);
  }
}
