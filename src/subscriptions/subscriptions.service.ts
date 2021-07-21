import { Injectable } from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionsService {
  public constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    private readonly configService: ConfigService,
  ) {}

  getAllSubscriptions() {
    return this.stripeClient.products.list({ active: true });
  }

  async getAllSubscriptionsPrices() {
    return this.stripeClient.prices.list({ active: true });
  }

  async createCheckoutSession(pricesId, email) {
    return this.stripeClient.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: pricesId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get<string>(
        'FRONTEND_URL',
      )}/back-office/dashboard/?purchase=success`,
      cancel_url: `${this.configService.get<string>(
        'FRONTEND_URL',
      )}/back-office/dashboard/?purchase=canceled`,
    });
  }
}
