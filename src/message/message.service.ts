import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import autobind from 'autobind-decorator';

import { RestaurantService } from '../restaurant/restaurant.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { TelegramService } from '../telegram/telegram.service';
import { AnalyticsService } from '../analytics/analytics.service';
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
    const checkIfChatExists = await this.restaurantService.checkIfChatExists(
      restaurantId,
      msg.chat.id,
    );

    if (!checkIfChatExists) {
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

    this.logger.warn(
      `A new chat has not been created. Because he already exists`,
      loggerContext,
    );
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

  @autobind
  async sendMessage(dto: CreateMessageDto) {
    const restaurant = await this.restaurantService.findById(dto.restaurantId);
    const table = restaurant.tables.find((t) => t._id.equals(dto.tableId));
    const action = restaurant.actions.find((a) => a._id.equals(dto.actionId));

    const text = `${table.name} - ${action.message}`;
    const replyMarkup = this.telegramService.createInlineKeyboard([
      this.telegramService.createInlineButton('✅', 'confirm'),
    ]);

    this.logger.log(
      `New message for restaurantId: ${restaurant._id}, tableId: ${table._id}}, action: ${action._id}, message: ${action.message}`,
      loggerContext,
    );
    await this.analyticsService.create({
      type: AnalyticType.ACTION_CALL,
      restaurantId: restaurant._id,
      tableId: table._id,
      actionId: action._id,
    });

    for (const username of restaurant.usernames) {
      await this.telegramService.sendMessage(username, text, { replyMarkup });
    }
  }
}
