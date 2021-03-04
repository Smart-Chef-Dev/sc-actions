import { Injectable } from '@nestjs/common';
// import * as TelegramBot from 'node-telegram-bot-api';
import * as TelegramBot from 'telebot';
import { ConfigService } from '@nestjs/config';
import { RestaurantService } from '../restaurant/restaurant.service';

@Injectable()
export class MessageService {
  bot: TelegramBot = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly restaurantService: RestaurantService,
  ) {
    this.bot = new TelegramBot({
      token: configService.get('telegramBotKey'),
    });

    this.bot.on(/^\/start (.+)$/, (...args: any[]) =>
      this.handleRestaurantCommand.apply(this, args),
    );
    this.bot.start();
  }

  async handleRestaurantCommand(msg, props) {
    const restaurantId = props.match[1];

    return this.restaurantService.updateById(restaurantId, {
      $push: { usernames: msg.chat.id },
    });
  }

  sendMessage(): Promise<any> {
    return new Promise(() => {});
    // return this.telegram.sendMessage('@pkarpovich', 'test');
  }
}
