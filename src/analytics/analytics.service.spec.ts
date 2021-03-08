import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

import { AnalyticsService } from './analytics.service';
import { Analytic, AnalyticSchema } from './schemas/analytic.schema';
import { AnalyticType } from './enums/analytic-type.enum';

let mongod: MongoMemoryServer;

describe('AnalyticsService', () => {
  let module: TestingModule;
  let service: AnalyticsService;

  afterEach(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    mongod = new MongoMemoryServer();
    module = await Test.createTestingModule({
      providers: [AnalyticsService],
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await mongod.getUri(),
            useFindAndModify: false,
          }),
        }),
        MongooseModule.forFeature([
          { name: Analytic.name, schema: AnalyticSchema },
        ]),
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an analytical entity', async () => {
    const restaurantId = 'restaurantId';
    const actionId = 'actionId';
    const tableId = 'tableId';

    const analytic = await service.create({
      type: AnalyticType.ACTION_CALL,
      restaurantId,
      tableId,
      actionId,
    });

    expect(analytic).toBeDefined();
    expect(analytic._id).toBeDefined();
    expect(analytic.restaurantId).toBe(restaurantId);
    expect(analytic.actionId).toBe(actionId);
    expect(analytic.tableId).toBe(tableId);
    expect(analytic.type).toBe(AnalyticType.ACTION_CALL);
  });
});
