import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  providers: [MessageService],
  controllers: [MessageController],
  imports: [ConfigModule, RestaurantModule],
})
export class MessageModule {}
