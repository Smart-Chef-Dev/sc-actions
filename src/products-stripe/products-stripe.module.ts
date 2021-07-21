import { Module } from '@nestjs/common';
import { ProductsStripeService } from './products-stripe.service';
import { ProductsStripeController } from './products-stripe.controller';
import { StripeModule } from 'nestjs-stripe';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_KEY'),
        apiVersion: '2020-08-27',
      }),
    }),
  ],
  controllers: [ProductsStripeController],
  providers: [ProductsStripeService],
})
export class ProductsStripeModule {}
