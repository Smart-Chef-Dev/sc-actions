import {
  Controller,
  Post,
  Res,
  Param,
  HttpStatus,
  Body,
  Logger,
} from '@nestjs/common';

import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { OrderDto } from './dto/order';
import { AnalyticType } from '../analytics/enums/analytic-type.enum';
import { RestaurantService } from '../restaurant/restaurant.service';
import { TelegramService } from '../telegram/telegram.service';
import { AnalyticsService } from '../analytics/analytics.service';

const loggerContext = 'Restaurant';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly restaurantService: RestaurantService,
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
    const table = restaurant.tables.find((t) => t._id.equals(tableId));
    const action = restaurant.actions.find((a) => a._id.equals(actionId));

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

    await this.messageService.sendMessages(
      text,
      replyMarkup,
      restaurant.usernames,
    );

    res.status(HttpStatus.OK).json({ ok: true });
  }

  @Post(':restaurantId/:tableId')
  async sendOrder(
    @Body() orderDto: OrderDto[],
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Res() res,
  ) {
    const restaurant = await this.restaurantService.findById(restaurantId);
    const table = restaurant.tables.find((t) => t._id.equals(tableId));

    let text = `person: ${orderDto[0].person}, ${table.name} -`;
    for (let i = 1; i < orderDto.length; i++) {
      text = text + ` ${orderDto[i].name}(${orderDto[i].count}),`;
    }

    const replyMarkup = this.telegramService.createInlineKeyboard([
      this.telegramService.createInlineButton('✅', 'confirm'),
    ]);

    await this.messageService.sendMessages(
      text,
      replyMarkup,
      restaurant.usernames,
    );

    res.status(HttpStatus.OK).json({ ok: true });
  }
}
