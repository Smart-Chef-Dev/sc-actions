import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StripeModule } from 'nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PriceStripeService } from './price-stripe.service';
import { PriceStripeController } from './price-stripe.controller';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  imports: [
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_KEY'),
        apiVersion: '2020-08-27',
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    SubscriptionsModule,
  ],
  controllers: [PriceStripeController],
  providers: [PriceStripeService],
})
export class PriceStripeModule {}
