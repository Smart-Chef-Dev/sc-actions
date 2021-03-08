import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { TelegramModule } from '../telegram/telegram.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  providers: [MessageService, Logger],
  controllers: [MessageController],
  imports: [ConfigModule, RestaurantModule, TelegramModule, AnalyticsModule],
})
export class MessageModule {}
