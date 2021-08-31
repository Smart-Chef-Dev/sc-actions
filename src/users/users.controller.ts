import {
  Controller,
  Post,
  Body,
  ForbiddenException,
  NotFoundException,
  Get,
  Delete,
  Req,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UseGuards } from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtGuard } from '../guard/jwt.guard';
import { Users } from './schemas/users.schema';
import { Role } from './enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sign-up')
  async signUp(@Body() dto: CreateUserDto) {
    const isEmailExists = await this.usersService.findByEmail(dto.email);

    if (isEmailExists) {
      throw new ForbiddenException('This email is already taken');
    }

    const isAlreadyLinkedToUser =
      await this.usersService.checkIfRestaurantIsTiedToRestaurantAdmin(
        dto?.restaurantId,
      );
    if (isAlreadyLinkedToUser) {
      throw new ForbiddenException(
        'The restaurant is already linked to the user',
      );
    }

    return this.usersService.creatAccount(dto, Role.RESTAURANT_ADMIN);
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

  @UseGuards(JwtGuard)
  @Get('subscription')
  async getSubscriptionById(@Req() req) {
    const user: Users = req.user;

    if (!user.subscription) {
      throw new ForbiddenException('Not subscribed');
    }

    return this.usersService.getSubscriptionById(user.subscription);
  }

  @UseGuards(JwtGuard)
  @Delete('subscription')
  async deleteSubscriptions(@Req() req) {
    const user: Users = req.user;

    if (!user.subscription) {
      throw new ForbiddenException('Not subscribed');
    }

    await this.usersService.updateById(user.id, { subscription: null });
    return this.usersService.deleteSubscriptions(user.subscription);
  }
}
