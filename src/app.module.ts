import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { RestaurantModule } from './restaurant/restaurant.module';
import { MessageModule } from './message/message.module';
import { TelegramModule } from './telegram/telegram.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MenuModule } from './menu/menu.module';
import { CategoryModule } from './category/category.module';
import { ImagesModule } from './images/images.module';
import { AppConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { ProductsStripeModule } from './products-stripe/products-stripe.module';
import { WebhookStripeModule } from './webhook-stripe/webhook-stripe.module';
import { StripeModule } from 'nestjs-stripe';

@Module({
  imports: [
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('STRIPE_KEY'),
        apiVersion: configService.get('STRIPE_API_VERSION'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '/../public'),
      serveRoot: '/public',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database'),
        useFindAndModify: false,
      }),
      inject: [ConfigService],
    }),
    AppConfigModule,
    RestaurantModule,
    TelegramModule,
    MessageModule,
    AnalyticsModule,
    MenuModule,
    CategoryModule,
    ImagesModule,
    ConfigModule,
    UsersModule,
    ProductsStripeModule,
    WebhookStripeModule,
  ],
})
export class AppModule {}
