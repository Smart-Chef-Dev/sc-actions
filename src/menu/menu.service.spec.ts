import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { join } from 'path';

import { MenuService } from './menu.service';
import { TelegramService } from '../telegram/telegram.service';
import { TelegramServiceMock } from '../telegram/telegram.service.mock';
import { RestaurantService } from '../restaurant/restaurant.service';

import { Category, CategorySchema } from './schemas/category.schema';
import { Course, CourseSchema } from './schemas/course.shema';

let mongod: MongoMemoryServer;

describe('MenuService', () => {
  let service: MenuService;
  let restaurantService: RestaurantService;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();

    const TelegramProvider = {
      provide: TelegramService,
      useClass: TelegramServiceMock,
    };

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
      providers: [
        MenuService,
        TelegramProvider,
        {
          provide: RestaurantService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  const restaurantId = '60b7ba683af95d1b6d9384a8';
  const tableId = '60b5098fc02166de9bacf191';
  const categoryName = 'Beverages';

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  const createMockRestaurant = () => {
    restaurantService.findById = jest.fn().mockReturnValue({
      _id: restaurantId,
      name: 'Restaurant',
      usernames: [],
      tables: [
        {
          _id: tableId,
          name: 'table1',
          code: 'table_code_1',
        },
      ],
      actions: [],
    });
  };

  it('should create a new category and output all categories from bd', async () => {
    createMockRestaurant();

    await service.addCategory(categoryName, restaurantId);
    const newCategory = await service.getCategory(restaurantId);

    expect(newCategory).toBeDefined();
    expect(newCategory[0].restaurant).toBeDefined();
    expect(newCategory[0].category).toBe(categoryName);
  });

  it('should course a new category and output all course from bd', async () => {
    createMockRestaurant();
    await service.addCategory(categoryName, restaurantId);

    await service.addCourse(
      {
        name: 'Tea',
        picture: 'http://localhost:3000/pancake.png',
        price: '0.1',
        weight: '10',
        time: '3',
        description: 'Ordinary tea',
        categoryName: categoryName,
      },
      restaurantId,
    );
    const newCourse = await service.getCourse(restaurantId);

    expect(newCourse).toBeDefined();
    expect(newCourse[0].name).toBe('Tea');
    expect(newCourse[0].picture).toBe('http://localhost:3000/pancake.png');
    expect(newCourse[0].price).toBe('0.1');
    expect(newCourse[0].weight).toBe('10');
    expect(newCourse[0].time).toBe('3');
    expect(newCourse[0].description).toBe('Ordinary tea');
    expect(newCourse[0].category.category).toBe(categoryName);
  });
});
