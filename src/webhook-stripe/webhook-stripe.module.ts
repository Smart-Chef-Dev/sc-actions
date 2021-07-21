import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { WebhookStripeController } from './webhook-stripe.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [UsersModule, SubscriptionsModule],
  controllers: [WebhookStripeController],
})
export class WebhookStripeModule {}
