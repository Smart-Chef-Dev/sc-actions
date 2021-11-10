import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import autobind from 'autobind-decorator';

import { RestaurantService } from 'src/restaurant/restaurant.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AnalyticType } from '../analytics/enums/analytic-type.enum';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';

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
    const table = restaurant.tables.find((table) => table._id.equals(tableId));

    const user = await this.usersService.findUserByUsernameInRestaurant(
      name,
      restaurantId,
    );
    if (+user?.telegramId === +msg.chat.id) {
      await msg.reply.text(`Welcome back ${name}`);
      return;
    }

    if (user) {
      await msg.reply.text(
        `Sorry, the name ${name} is already taken. Try to create a chat again`,
      );
      return;
    }

    const newUser = await this.usersService.creatAccount(
      {
        telegramId: msg.chat.id,
        name,
        restaurantId,
      },
      Role.WAITER,
    );

    const isUserAlreadyAssignedToTable = table.userIds.find((userId) =>
      newUser._id.equals(userId),
    );
    if (isUserAlreadyAssignedToTable) {
      return;
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

    await msg.reply.text(
      `You were added to the restaurant "${restaurant.name}" successfully`,
    );

    await this.analyticsService.create({
      type: AnalyticType.NEW_WAITER,
      restaurantId,
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
