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
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
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
    RestaurantModule,
    MessageModule,
    TelegramModule,
    AnalyticsModule,
    MenuModule,
    CategoryModule,
    ImagesModule,
  ],
})
export class AppModule {}
