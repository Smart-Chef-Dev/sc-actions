import { Controller, Get, Param, Post, Redirect, Res } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  getAllSubscriptions() {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @Get('prices')
  getAllSubscriptionsPrices() {
    return this.subscriptionsService.getAllSubscriptionsPrices();
  }

  @Post(':subscriptionsId/prices/:pricesId/create-checkout-session')
  async createCheckoutSession(
    @Param('subscriptionsId') subscriptionsId: string,
    @Param('pricesId') pricesId: string,
    @Res() res,
  ) {
    const subscriptions = await this.subscriptionsService.getSubscription(
      subscriptionsId,
    );
    const subscriptionPrice =
      await this.subscriptionsService.getSubscriptionPrice(pricesId);

    const session = await this.subscriptionsService.createCheckoutSession(
      subscriptions.name,
      subscriptions.images,
      subscriptionPrice.unit_amount,
      subscriptionPrice.currency,
    );

    return res.redirect(session.url);
  }
}
