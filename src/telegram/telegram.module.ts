import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [ConfigModule],
})
export class TelegramModule {}
