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
    return this.stripeClient.products.list();
  }

  getAllSubscriptionsPrices() {
    return this.stripeClient.prices.list();
  }

  getSubscription(id: string) {
    return this.stripeClient.products.retrieve(id);
  }

  getSubscriptionPrice(id: string) {
    return this.stripeClient.prices.retrieve(id);
  }

  async createCheckoutSession(name, images, unit_amount, currency) {
    return this.stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: name,
              images: images,
            },
            unit_amount: unit_amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get<string>(
        'FRONTEND_URL',
      )}?success=true`,
      cancel_url: `${this.configService.get<string>(
        'FRONTEND_URL',
      )}?canceled=true`,
    });
  }
}
