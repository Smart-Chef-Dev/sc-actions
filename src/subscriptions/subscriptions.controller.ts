import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  Headers,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { UsersService } from 'src/users/users.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getAllSubscriptions() {
    return this.subscriptionsService.getAllSubscriptions();
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
