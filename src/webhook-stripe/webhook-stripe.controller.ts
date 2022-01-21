import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { RestaurantService } from '../restaurant/restaurant.service';

@Controller('webhook-stripe')
export class WebhookStripeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly restaurantService: RestaurantService,
  ) {}

  @Post()
  async webhook(@Req() req, @Res() res) {
    const event = req.body;

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const user = await this.usersService.findByEmail(
          event.data.object.customer_email,
        );

        if (user.subscription) {
          await this.usersService.deleteSubscriptions(user.subscription);
        }

        await this.usersService.updateById(user._id, {
          subscription: event.data.object.subscription,
        });
        await this.restaurantService.updateById(user.restaurantId, {
          isAccessDisabled: false,
        });

        break;
      }
      case 'invoice.payment_failed': {
        const user = await this.usersService.findByEmail(
          event.data.object.customer_email,
        );

        await this.restaurantService.updateById(user.restaurantId, {
          isAccessDisabled: true,
        });

        break;
      }
    }

    return res.status(HttpStatus.OK).json();
  }
}
