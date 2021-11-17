import { Injectable } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';

@Injectable()
export class ProductsStripeService {
  public constructor(@InjectStripe() private readonly stripeClient: Stripe) {}

  findById(id: string) {
    return this.stripeClient.products.retrieve(id);
  }

  findByPriceId(id: string) {
    return this.stripeClient.prices.retrieve(id);
  }
}
