import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose, Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { RestaurantService } from '../restaurant/restaurant.service';
import { CategoryService } from './category.service';
import { Category, CategorySchema } from './schemas/category.schema';

let mongod: MongoMemoryServer;

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

  const restaurantId = Types.ObjectId('569ed8269353e9f4c51617aa');
  beforeEach(() => {
    restaurantService.findById = jest.fn().mockReturnValue({
      _id: restaurantId,
      name: 'Restaurant',
      usernames: [],
      tables: [],
      actions: [],
    });
  });

  const name = 'teas';
  const createCategory = () => {
    return service.create(name, String(restaurantId));
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const category = await createCategory();

    expect(category).toBeDefined();
    expect(category._id).toBeDefined();
    expect(category.name).toBe(name);
    expect(category.restaurant._id).toBe(restaurantId);
  });

  it('should return all categories', async () => {
    const category1 = await createCategory();
    const category2 = await createCategory();

    const allCategory = await service.findAll(String(restaurantId));

    expect(allCategory).toBeDefined();
    expect(allCategory.length).toBe(2);
    expect(allCategory[0]._id).toStrictEqual(category1._id);
    expect(allCategory[0].name).toStrictEqual(category1.name);
    expect(allCategory[0].restaurant._id).toStrictEqual(restaurantId);
    expect(allCategory[1]._id).toStrictEqual(category2._id);
    expect(allCategory[1].name).toStrictEqual(category2.name);
    expect(allCategory[1].restaurant._id).toStrictEqual(restaurantId);
    expect(allCategory[0]._id).not.toBe(allCategory[1]._id);
  });

  it('should return categories by id', async () => {
    const category = await createCategory();

    const categoryById = await service.findById(category._id);

    expect(categoryById).toBeDefined();
    expect(categoryById._id).toStrictEqual(category._id);
    expect(categoryById.name).toBe(category.name);
  });
});
