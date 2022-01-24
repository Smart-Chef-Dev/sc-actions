import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import autobind from 'autobind-decorator';

import { RestaurantService } from 'src/restaurant/restaurant.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AnalyticType } from '../analytics/enums/analytic-type.enum';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { nanoid } from 'nanoid';

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
    const [restaurantId, tableId, waiterName] = props.match[1].split(
      this.configService.get<string>('TELEGRAM_START_CMD_DELIMITER'),
    );

    const telegramId = +msg.chat.id;

    const replyText = await this.addWaiterIntoRestaurant(
      restaurantId,
      telegramId,
      tableId,
      waiterName,
    );

    if (replyText) {
      await msg.reply.text(replyText);
    }
  }

  async addWaiterIntoRestaurant(
    restaurantId: string,
    telegramId: number,
    tableId: string,
    waiterName: string,
  ): Promise<string> {
    const user = await this.usersService.findByTelegramId(telegramId);
    if (user) {
      return `Welcome back!`;
    }
    const restaurant = await this.restaurantService.findById(restaurantId);
    if (!restaurant) {
      return `A restaurant with this id will not be found!`;
    }
    const table = restaurant.tables.find((table) => table._id.equals(tableId));
    if (tableId && !table) {
      return `A table with this id will not be found!`;
    }

    const newUser = await this.usersService.creatAccount(
      {
        telegramId: telegramId.toString(),
        name: waiterName ?? `UNTITLED_${nanoid()}`,
        restaurantId,
      },
      Role.WAITER,
    );
    if (tableId) {
      await this.restaurantService.assignWaitersToTable(
        restaurant,
        table,
        newUser,
      );
    }

    this.logger.log(
      `Add new chat (${newUser.name}) into restaurant, restaurantId: ${restaurantId}`,
      loggerContext,
    );
    await this.analyticsService.create({
      type: AnalyticType.NEW_WAITER,
      restaurantId,
    });

    return tableId
      ? `You have been successfully added to the restaurant "${restaurant.name}". You will receive a message from the table "${table.name}"`
      : `You have been successfully added to the restaurant "${restaurant.name}". You will receive messages from all tables`;
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
