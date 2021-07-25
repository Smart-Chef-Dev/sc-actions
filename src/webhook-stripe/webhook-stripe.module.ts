import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { WebhookStripeController } from './webhook-stripe.controller';

@Module({
  imports: [UsersModule],
  controllers: [WebhookStripeController],
})
export class WebhookStripeModule {}
