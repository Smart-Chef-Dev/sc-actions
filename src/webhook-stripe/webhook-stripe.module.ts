import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users/users.module';
import { WebhookStripeController } from './webhook-stripe.controller';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [UsersModule, RestaurantModule],
  controllers: [WebhookStripeController],
})
export class WebhookStripeModule {}
