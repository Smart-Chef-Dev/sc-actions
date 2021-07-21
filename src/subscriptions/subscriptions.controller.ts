import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

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

  @Get('prices')
  getAllSubscriptionsPrices() {
    return this.subscriptionsService.getAllSubscriptionsPrices();
  }

  @Post('/prices/:pricesId/create-checkout-session')
  async createCheckoutSession(
    @Param('pricesId') pricesId: string,
    @Headers('authorization') authorization,
  ) {
    const jwt = authorization.split(' ')[1];
    const payload = await this.usersService.decodeJwt(jwt);

    const session = await this.subscriptionsService.createCheckoutSession(
      pricesId,
      payload['email'],
    );

    return session.url;
  }

  @Post('/webhook')
  async webhook(@Req() req, @Res() res) {
    const event = req.body;

    if (event.type === 'invoice.payment_succeeded') {
      const user = await this.usersService.findByEmail(
        event.data.object.customer_email,
      );
      await this.usersService.updateById(user._id, {
        subscription: event.data.object.subscription,
      });
    }

    return res.status(HttpStatus.OK).json();
  }
}
