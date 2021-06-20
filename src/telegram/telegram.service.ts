import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as TelegramBot from 'telebot';
import { ConfigService } from '@nestjs/config';
import autobind from 'autobind-decorator';

@Injectable()
export class TelegramService implements OnModuleInit {
  bot: TelegramBot = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  onModuleInit(): any {
    this.bot = new TelegramBot({
      token: this.configService.get('telegramBotKey'),
    });

    this.bot.start();
  }

  @autobind
  subscribeToEvents(events) {
    for (const [name, callback] of events) {
      this.bot.on(name, callback);
    }
  }

  @autobind
  async editMessageText(chatId: string, messageId: number, newText: string) {
    return this.bot.editMessageText(
      {
        messageId,
        chatId,
      },
      newText,
    );
  }

  @autobind
  async sendMessage(chatId: string, text: string, options: any = {}) {
    try {
      await this.bot.sendMessage(chatId, text, options);
    } catch (err) {
      if (err.error_code === 403) {
        this.logger.warn(
          `Failed to send a message to the user(${chatId}). By reason ${err.description}`,
        );
      }
    }
  }

  @autobind
  async sendMessageToMultipleUsers(
    text: string,
    replyMarkup: string,
    username: Array<string>,
  ) {
    for (const name of username) {
      await this.sendMessage(name, text, { replyMarkup });
    }
  }

  @autobind
  createInlineKeyboard(buttons) {
    return this.bot.inlineKeyboard([buttons]);
  }

  @autobind
  createInlineButton(text: string, callback: string) {
    return this.bot.inlineButton(text, { callback });
  }
}
