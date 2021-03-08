import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

import { MessageService } from './message.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { Action, ActionSchema } from '../restaurant/schemas/action.schema';
import { Table, TableSchema } from '../restaurant/schemas/table.schema';
import { TelegramService } from '../telegram/telegram.service';
import { TelegramServiceMock } from '../telegram/telegram.service.mock';
import { AnalyticsModule } from '../analytics/analytics.module';

let mongod: MongoMemoryServer;

describe('MessageService', () => {
  let module: TestingModule;
  let service: MessageService;

  afterEach(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    mongod = new MongoMemoryServer();

    const TelegramProvider = {
      provide: TelegramService,
      useClass: TelegramServiceMock,
    };

    module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await mongod.getUri(),
          }),
        }),
        MongooseModule.forFeature([
          { name: Restaurant.name, schema: RestaurantSchema },
          { name: Action.name, schema: ActionSchema },
          { name: Table.name, schema: TableSchema },
        ]),
        AnalyticsModule,
      ],
      providers: [
        ConfigService,
        MessageService,
        Logger,
        RestaurantService,
        TelegramProvider,
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
