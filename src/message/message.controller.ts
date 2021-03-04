import { Controller, Get, Res, HttpStatus } from '@nestjs/common';

import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async test(@Res() res) {
    const message = await this.messageService.sendMessage();

    res.status(HttpStatus.OK).json(message.message_id);
  }
}
