import {
  Controller,
  Get,
  Headers,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SubscriptionsService } from './subscriptions.service';
import { UsersService } from 'src/users/users.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  async getSubscriptions(@Headers('authorization') authorization) {
    const jwt = authorization.split(' ')[1];
    const payload = await this.jwtService.verify(jwt);

    const user = await this.usersService.findByEmail(payload.email);
    if (!user.subscription) {
      throw new ForbiddenException('Not subscribed');
    }

    return this.subscriptionsService.getSubscription(user.subscription);
  }

  @Delete()
  async deleteSubscriptions(@Headers('authorization') authorization) {
    const jwt = authorization.split(' ')[1];
    const payload = await this.jwtService.verify(jwt);

    const user = await this.usersService.findByEmail(payload.email);
    if (!user.subscription) {
      throw new ForbiddenException('Not subscribed');
    }

    await this.usersService.updateById(user.id, { subscription: null });
    return this.subscriptionsService.deleteSubscriptions(user.subscription);
  }
}
