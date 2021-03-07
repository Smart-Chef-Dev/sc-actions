import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { RestaurantModule } from './restaurant/restaurant.module';
import { MessageModule } from './message/message.module';
import { TelegramModule } from './telegram/telegram.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
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
  ],
})
export class AppModule {}
