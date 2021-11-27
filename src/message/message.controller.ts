import {
  Controller,
  Post,
  Res,
  Param,
  HttpStatus,
  Body,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { OrderDto } from './dto/order';
import { AnalyticType } from 'src/analytics/enums/analytic-type.enum';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { MessageService } from './message.service';
import { UsersService } from '../users/users.service';

const loggerContext = 'Restaurant';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly restaurantService: RestaurantService,
    private readonly usersService: UsersService,
    private readonly logger: Logger,
    private readonly telegramService: TelegramService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post(':restaurantId/:tableId/:actionId')
  async sendAction(
    @Res() res,
    @Param('restaurantId') restaurantId,
    @Param('tableId') tableId,
    @Param('actionId') actionId,
  ) {
    const restaurant = await this.restaurantService.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with id(${restaurantId}) does not exist`,
      );
    }

    const table = restaurant.tables.find((t) => t._id.equals(tableId));

    if (!table) {
      throw new NotFoundException(
        `The table with id (${tableId}) does not exist in the restaurant with id (${restaurantId}).`,
      );
    }

    const action = restaurant.actions.find((a) => a._id.equals(actionId));

    const text = `${table.name} - ${action.message}`;
    const replyMarkup = this.telegramService.createInlineKeyboard([
      this.telegramService.createInlineButton('✅', 'confirm'),
    ]);

    const restaurantUserIds = (
      await this.usersService.findAllByRestaurantId(restaurantId)
    ).map((r) => r._id);
    const targetUserIds = Array.from(
      new Set([...restaurantUserIds, ...table.userIds]),
    );

    await this.telegramService.sendMessageToAssignedWaiters(
      targetUserIds,
      text,
      {
        replyMarkup,
      },
    );

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

    res.status(HttpStatus.OK).json({ ok: true });
  }

  @Post(':restaurantId/:tableId')
  async sendOrder(
    @Body() dto: OrderDto,
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Res() res,
  ) {
    const restaurant = await this.restaurantService.findById(restaurantId);

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with id(${restaurantId}) does not exist`,
      );
    }

    const table = restaurant.tables.find((t) => t._id.equals(tableId));

    if (!table) {
      throw new NotFoundException(
        `The table with id (${tableId}) does not exist in the restaurant with id (${restaurantId}).`,
      );
    }

    const text = dto.order.reduce((previousValues, currentOrder) => {
      const isAddons = !!currentOrder.addons.find((m) => m.isIncludedInOrder);

      if (isAddons) {
        const addons = currentOrder.addons.reduce(
          (previousAddons, currentAddons) =>
            currentAddons.isIncludedInOrder
              ? previousAddons + `\n  ${currentAddons.name}`
              : previousAddons,
          `\n addons:`,
        );

        return (
          previousValues +
          `\n${currentOrder.name} ${currentOrder.count}` +
          addons
        );
      }

      return previousValues + `\n${currentOrder.name} ${currentOrder.count}`;
    }, '\n' + `person: ${dto.personCount}, ${table.name}`);

    const replyMarkup = this.telegramService.createInlineKeyboard([
      this.telegramService.createInlineButton('✅', 'confirm'),
    ]);

    await this.telegramService.sendMessageToAssignedWaiters(
      table.userIds,
      text,
      {
        replyMarkup,
      },
    );

    this.logger.log(
      `New message for restaurantId: ${restaurant._id}, tableId: ${table._id}, \n message: ${text}`,
      loggerContext,
    );

    await this.analyticsService.create({
      type: AnalyticType.ACTION_CALL,
      restaurantId: restaurant._id,
      tableId: table._id,
    });

    res.status(HttpStatus.OK).json({ ok: true });
  }
}
