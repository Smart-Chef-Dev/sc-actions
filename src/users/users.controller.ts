import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  async signUp(@Body() dto: CreateUserDto) {
    const isEmailExists = await this.usersService.findByEmail(dto.email);

    if (isEmailExists) {
      throw new ForbiddenException('This email is already taken');
    }

    return this.usersService.signUp(dto);
  }

  @Post('sing-in')
  async singIn(@Body() dto: CreateUserDto) {
    const user = await this.usersService.findByEmail(dto.email);
    const isHashMatchesPassword = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isHashMatchesPassword) {
      throw new NotFoundException('Wrong login or password');
    }

    return this.usersService.singIn(dto);
  }
}