import { Controller, Post, Res, Param, HttpStatus, Body } from '@nestjs/common';

import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { OrderDto } from './dto/order';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':restaurantId/:tableId/:actionId')
  async sendAction(
    @Res() res,
    @Param('restaurantId') restaurantId,
    @Param('tableId') tableId,
    @Param('actionId') actionId,
  ) {
    await this.messageService.sendAction(
      new CreateMessageDto({
        restaurantId,
        actionId,
        tableId,
      }),
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
    await this.messageService.sendOrder(orderDto, restaurantId, tableId);

    res.status(HttpStatus.OK).json({ ok: true });
  }
}
