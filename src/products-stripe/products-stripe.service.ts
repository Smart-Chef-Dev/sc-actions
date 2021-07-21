import { Injectable } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';

@Injectable()
export class ProductsStripeService {
  public constructor(@InjectStripe() private readonly stripeClient: Stripe) {}

  findAll() {
    return this.stripeClient.products.list({ active: true });
  }
}
