import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { join } from 'path';

import { MenuService } from './menu.service';
import { TelegramService } from '../telegram/telegram.service';
import { TelegramServiceMock } from '../telegram/telegram.service.mock';
import { RestaurantService } from '../restaurant/restaurant.service';

import { Category, CategorySchema } from '../category/schemas/category.schema';
import { Course, CourseSchema } from './schemas/course.shema';
import { Mongoose } from 'mongoose';

let mongod: MongoMemoryServer;

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await mongod.getUri(),
            useFindAndModify: false,
          }),
        }),
        MongooseModule.forFeature([
          { name: Category.name, schema: CategorySchema },
          { name: Course.name, schema: CourseSchema },
        ]),
        ServeStaticModule.forRoot({
          rootPath: join(__filename, '../photos'),
        }),
      ],
      providers: [MenuService, Mongoose],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });
});
