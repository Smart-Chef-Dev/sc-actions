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
    const [restaurantId, tableId, name] = props.match[1].split(
      this.configService.get<string>('TELEGRAM_START_CMD_DELIMITER'),
    );
    const telegramId = +msg.chat.id;

    const replyText =
      !tableId && !name
        ? await this.addWaiterIntoRestaurant(restaurantId, telegramId)
        : await this.addWaiterIntoRestaurantTable(
            restaurantId,
            tableId,
            name,
            +msg.chat.id,
          );

    if (replyText) {
      await msg.reply.text(replyText);
    }
  }

  @autobind
  async addWaiterIntoRestaurantTable(
    restaurantId: string,
    tableId: string,
    waiterName: string,
    telegramId: number,
  ): Promise<string> {
    const restaurant = await this.restaurantService.findById(restaurantId);
    const table = restaurant.tables.find((table) => table._id.equals(tableId));

    const user = await this.usersService.findUserByUsernameInRestaurant(
      waiterName,
      restaurantId,
    );
    if (+user?.telegramId === telegramId) {
      return `Welcome back ${waiterName}`;
    }

    if (user) {
      return `Sorry, the name ${waiterName} is already taken. Try to create a chat again`;
    }

    const newUser = await this.usersService.creatAccount(
      {
        telegramId: telegramId.toString(),
        name: waiterName,
        restaurantId,
      },
      Role.WAITER,
    );

    const isUserAlreadyAssignedToTable = table.userIds.find((userId) =>
      newUser._id.equals(userId),
    );
    if (isUserAlreadyAssignedToTable) {
      return '';
    }
    await this.restaurantService.assignWaitersToTable(
      restaurant,
      table,
      newUser,
    );

    this.logger.log(
      `Add new chat into restaurant, restaurantId: ${restaurantId}`,
      loggerContext,
    );

    await this.analyticsService.create({
      type: AnalyticType.NEW_WAITER,
      restaurantId,
    });

    return `You were added to the restaurant "${restaurant.name}" successfully`;
  }

  async addWaiterIntoRestaurant(
    restaurantId: string,
    telegramId: number,
  ): Promise<string> {
    const restaurant = await this.restaurantService.findById(restaurantId);

    const newUser = await this.usersService.creatAccount(
      {
        telegramId: telegramId.toString(),
        name: `UNTITLED_${nanoid()}`,
        restaurantId,
      },
      Role.WAITER,
    );

    this.logger.log(
      `Add new chat (${newUser.name}) into restaurant, restaurantId: ${restaurantId}`,
      loggerContext,
    );

    await this.analyticsService.create({
      type: AnalyticType.NEW_WAITER,
      restaurantId,
    });

    return `You were added to the restaurant "${restaurant.name}" successfully`;
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
