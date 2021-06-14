import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { RestaurantService } from '../restaurant/restaurant.service';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from './schemas/category.schema';

let mongod: MongoMemoryServer;
let mongoose = require('mongoose');

describe('CategoryService', () => {
  let service: CategoryService;
  let restaurantService: RestaurantService;

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
        ]),
      ],
      providers: [
        CategoryService,
        Mongoose,
        {
          provide: RestaurantService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    restaurantService = module.get<RestaurantService>(RestaurantService);
  });

  const restaurantId = mongoose.Types.ObjectId('569ed8269353e9f4c51617aa');
  beforeEach(() => {
    restaurantService.findById = jest.fn().mockReturnValue({
      _id: restaurantId,
      name: 'Restaurant',
      usernames: [],
      tables: [],
      actions: [],
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const name = 'teas';
    const category = await service.create({
      name: name,
      restaurantId: restaurantId,
    });

    expect(category).toBeDefined();
    expect(category._id).toBeDefined();
    expect(category.category).toBe(name);
    expect(category.restaurant._id).toBe(restaurantId);
  });

  it('should return all categories', async () => {
    const category = await service.create({
      name: 'teas',
      restaurantId: restaurantId,
    });

    const allCategory = await service.findAll(category.restaurant._id);

    expect(allCategory).toBeDefined();
    expect(allCategory[0]._id).toStrictEqual(category._id);
    expect(allCategory[0].category).toStrictEqual(category.category);
    expect(allCategory[0].restaurant._id).toStrictEqual(
      category.restaurant._id,
    );
    expect(allCategory[0].restaurant.name).toStrictEqual(
      category.restaurant.name,
    );
    expect(allCategory[0].restaurant.usernames).toBeDefined();
    expect(allCategory[0].restaurant.tables).toBeDefined();
    expect(allCategory[0].restaurant.actions).toBeDefined();
  });
});
