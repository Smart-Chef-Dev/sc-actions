import { Controller, Post, Res, Param, HttpStatus } from '@nestjs/common';

import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post(':restaurantId/:tableId/:actionId')
  async test(
    @Res() res,
    @Param('restaurantId') restaurantId,
    @Param('tableId') tableId,
    @Param('actionId') actionId,
  ) {
    await this.messageService.sendMessage(
      new CreateMessageDto({
        restaurantId,
        actionId,
        tableId,
      }),
    );

    res.status(HttpStatus.OK).json({ ok: true });
  }
}
