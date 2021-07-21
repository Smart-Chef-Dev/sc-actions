import { Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PriceStripeService } from './price-stripe.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('price-stripe')
export class PriceStripeController {
  constructor(
    private readonly priceStripeService: PriceStripeService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get()
  findAll() {
    return this.priceStripeService.findAll();
  }

  @Post('/:pricesId/create-checkout-session')
  async createCheckoutSession(
    @Param('pricesId') pricesId: string,
    @Headers('authorization') authorization,
  ) {
    const jwt = authorization.split(' ')[1];
    const payload = await this.jwtService.decode(jwt);

    const session = await this.subscriptionsService.createCheckoutSession(
      pricesId,
      payload['email'],
    );

    return session.url;
  }
}
