import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('webhook-stripe')
export class WebhookStripeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  async webhook(@Req() req, @Res() res) {
    const event = req.body;

    if (event.type === 'invoice.payment_succeeded') {
      const user = await this.usersService.findByEmail(
        event.data.object.customer_email,
      );

      console.log(user.subscription);
      if (user.subscription) {
        await this.subscriptionsService.deleteSubscriptions(user.subscription);
      }

      await this.usersService.updateById(user._id, {
        subscription: event.data.object.subscription,
      });
    }

    return res.status(HttpStatus.OK).json();
  }
}
