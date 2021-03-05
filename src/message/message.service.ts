import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'telebot';
import { ConfigService } from '@nestjs/config';
import { RestaurantService } from '../restaurant/restaurant.service';
import { CreateMessageDto } from './dto/create-message.dto';

const loggerContext = 'Restaurant';

@Injectable()
export class MessageService {
  bot: TelegramBot = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly restaurantService: RestaurantService,
    private readonly logger: Logger,
  ) {
    this.bot = new TelegramBot({
      token: configService.get('telegramBotKey'),
    });

    this.handleCallbackQuery = this.handleCallbackQuery.bind(this);
    this.handleStartCommand = this.handleStartCommand.bind(this);

    this.bot.on(/^\/start (.+)$/, this.handleStartCommand);
    this.bot.on('callbackQuery', this.handleCallbackQuery);
    this.bot.start();
  }

  async handleStartCommand(msg, props) {
    const restaurantId = props.match[1];

    this.logger.log(
      `Add new chat into restaurant, restaurantId: ${restaurantId}`,
      loggerContext,
    );

    return this.restaurantService.updateById(restaurantId, {
      $push: { usernames: msg.chat.id },
    });
  }

  handleCallbackQuery({ message }) {
    this.logger.log(
      `Edit message in chat, message: ${message.text}`,
      loggerContext,
    );

    this.bot.editMessageText(
      {
        chatId: message.chat.id,
        messageId: message.message_id,
      },
      `${message.text} ✅`,
    );
  }

  async sendMessage(dto: CreateMessageDto) {
    const restaurant = await this.restaurantService.findById(dto.restaurantId);
    const table = restaurant.tables.find((t) => t._id.equals(dto.tableId));
    const action = restaurant.actions.find((a) => a._id.equals(dto.actionId));

    const replyMarkup = this.bot.inlineKeyboard([
      [this.bot.inlineButton('✅', { callback: 'this_is_data2' })],
    ]);

    this.logger.log(
      `New message for restaurantId: ${restaurant._id}, tableId: ${table._id}}, action: ${action._id}, message: ${action.message}`,
      loggerContext,
    );

    for (const username of restaurant.usernames) {
      await this.bot.sendMessage(
        username,
        `Table: ${table.name}. Action: ${action.message}`,
        { replyMarkup },
      );
    }
  }
}
