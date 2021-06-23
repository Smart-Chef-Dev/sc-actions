import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import autobind from 'autobind-decorator';

import { RestaurantService } from 'src/restaurant/restaurant.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AnalyticType } from '../analytics/enums/analytic-type.enum';

const loggerContext = 'Restaurant';

@Injectable()
export class MessageService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly restaurantService: RestaurantService,
    private readonly logger: Logger,
    private readonly telegramService: TelegramService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  onModuleInit() {
    this.telegramService.subscribeToEvents([
      [/^\/start (.+)$/, this.handleStartCommand],
      ['callbackQuery', this.handleCallbackQuery],
    ]);
  }

  @autobind
  async handleStartCommand(msg, props) {
    const restaurantId = props.match[1];
    const restaurant = await this.restaurantService.findById(restaurantId);

    const isChatExist = await this.restaurantService.checkIfChatExist(
      restaurantId,
      msg.chat.id,
    );

    if (isChatExist) {
      this.logger.warn(
        `A new chat has not been created. Because he already exists`,
        loggerContext,
      );
      return;
    }

    this.logger.log(
      `Add new chat into restaurant, restaurantId: ${restaurantId}`,
      loggerContext,
    );

    await this.analyticsService.create({
      type: AnalyticType.NEW_WAITER,
      restaurantId,
    });

    await msg.reply.text(
      `You were added to the restaurant "${restaurant.name}" successfully`,
    );

    return this.restaurantService.updateById(restaurantId, {
      $push: { usernames: msg.chat.id },
    });
  }

  @autobind
  async handleCallbackQuery({ message }) {
    const text = `${message.text} ✅`;

    this.logger.log(`Edit message in chat, message: ${text}`, loggerContext);
    await this.analyticsService.create({
      type: AnalyticType.COMPLETE_ACTION,
    });

    await this.telegramService.editMessageText(
      message.chat.id,
      message.message_id,
      text,
    );
  }
}
