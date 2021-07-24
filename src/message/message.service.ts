import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import autobind from 'autobind-decorator';

import { RestaurantService } from 'src/restaurant/restaurant.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AnalyticType } from '../analytics/enums/analytic-type.enum';
import { UsersService } from 'src/users/users.service';

const loggerContext = 'Restaurant';

@Injectable()
export class MessageService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly restaurantService: RestaurantService,
    private readonly logger: Logger,
    private readonly telegramService: TelegramService,
    private readonly analyticsService: AnalyticsService,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit() {
    this.telegramService.subscribeToEvents([
      [/^\/start (.+)$/, this.handleStartCommand],
      ['callbackQuery', this.handleCallbackQuery],
    ]);
  }

  @autobind
  async handleStartCommand(msg, props) {
    const [restaurantId, tableId, name] = props.match[1].split(
      this.configService.get<string>('TELEGRAM_START_CMD_DELIMITER'),
    );
    const restaurant = await this.restaurantService.findById(restaurantId);

    const isUser = await this.usersService.checkIfUsernameExistsInRestaurant(
      name,
      restaurantId,
    );
    if (isUser) {
      await msg.reply.text(
        `Sorry, the name ${name} is already taken. Try to create a chat again`,
      );
      this.logger.warn(
        `The chat was not created for the reason: the user with the name ${name} already exists`,
        loggerContext,
      );
      return;
    }

    this.logger.log(
      `Add new chat into restaurant, restaurantId: ${restaurantId}`,
      loggerContext,
    );

    await msg.reply.text(
      `You were added to the restaurant "${restaurant.name}" successfully`,
    );

    await this.analyticsService.create({
      type: AnalyticType.NEW_WAITER,
      restaurantId,
    });
    const user = await this.usersService.creatAccount({
      telegramId: msg.chat.id,
      name,
      restaurantId,
    });
    return this.usersService.assignUserToTable(restaurantId, tableId, user._id);
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
