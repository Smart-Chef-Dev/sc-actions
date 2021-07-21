import { Injectable } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';

@Injectable()
export class PriceStripeService {
  public constructor(@InjectStripe() private readonly stripeClient: Stripe) {}

  findAll() {
    return this.stripeClient.prices.list({ active: true });
  }
}
