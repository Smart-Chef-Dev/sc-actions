import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { Model, Mongoose, Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { CategoryService } from './category.service';
import { Category, CategorySchema } from './schemas/category.schema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';

let mongod: MongoMemoryServer;

describe('CategoryService', () => {
  let service: CategoryService;
  let restaurantModel: Model<Restaurant>;

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
          { name: Restaurant.name, schema: RestaurantSchema },
        ]),
      ],
      providers: [CategoryService, Mongoose],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    restaurantModel = module.get<Model<Restaurant>>('RestaurantModel');
  });

  const restaurantId = Types.ObjectId('569ed8269353e9f4c51617aa');

  const name = 'teas';
  const createCategory = () => {
    const restaurant = new restaurantModel({
      _id: restaurantId,
      actions: [],
      tables: [],
      currencyCode: 'USD',
      name: 'Bit Adventure 2',
    });
    return service.create(name, restaurant);
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

  it('should find a category by restaurant name', async () => {
    const category = await createCategory();

    const foundCategory1 = await service.findCategoriesByNameInRestaurant(
      name,
      String(restaurantId),
    );

    expect(foundCategory1).toBeDefined();
    expect(foundCategory1.restaurant._id).toStrictEqual(restaurantId);
    expect(foundCategory1.name).toBe(category.name);

    const foundCategory2 = await service.findCategoriesByNameInRestaurant(
      'Bob',
      String(restaurantId),
    );

    expect(foundCategory2).toBe(null);
  });

  it('should remove the category', async () => {
    const category = await createCategory();

    await service.removeCategory(category._id);
    const foundCategory = await service.findById(category._id);

    expect(foundCategory).toBe(null);
  });

  it('should update category', async () => {
    const category = await createCategory();

    const newName = 'coffees';
    const updatedCategory = await service.updateById(category._id, {
      name: newName,
    });

    expect(updatedCategory).toBeDefined();
    expect(updatedCategory._id).toStrictEqual(category._id);
    expect(updatedCategory.name).toBe(newName);
  });

  it('should swap categories', async () => {
    const category1 = await createCategory();
    const category2 = await createCategory();

    expect(category1.n).toBe(0);
    expect(category2.n).toBe(1);

    await service.swapCategories(category1, category2);
    const foundCategory1 = await service.findById(category1._id);
    const foundCategory2 = await service.findById(category2._id);

    expect(foundCategory1.n).toBe(1);
    expect(foundCategory2.n).toBe(0);
  });
});
