import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  NotFoundException,
  Get,
  Headers,
  Delete,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

    if (!user) {
      throw new NotFoundException('This email is not registered');
    }

    const isHashMatchesPassword = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!isHashMatchesPassword) {
      throw new NotFoundException('Wrong password');
    }

    return this.usersService.singIn(dto);
  }

  @Get('subscription')
  async getSubscriptions(@Headers('authorization') authorization) {
    const jwt = authorization.split(' ')[1];
    const payload = await this.jwtService.verify(jwt);

    const user = await this.usersService.findByEmail(payload.email);
    if (!user.subscription) {
      throw new ForbiddenException('Not subscribed');
    }

    return this.usersService.getSubscription(user.subscription);
  }

  @Delete('subscription')
  async deleteSubscriptions(@Headers('authorization') authorization) {
    const jwt = authorization.split(' ')[1];
    const payload = await this.jwtService.verify(jwt);

    const user = await this.usersService.findByEmail(payload.email);
    if (!user.subscription) {
      throw new ForbiddenException('Not subscribed');
    }

    await this.usersService.updateById(user.id, { subscription: null });
    return this.usersService.deleteSubscriptions(user.subscription);
  }
}
