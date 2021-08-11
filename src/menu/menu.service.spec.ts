import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongoose, Types, Model } from 'mongoose';

import { MenuService } from './menu.service';

import { Category, CategorySchema } from '../category/schemas/category.schema';
import { MenuItems, MenuItemsSchema } from './schemas/menuItems.shema';
import { Addon, AddonSchema } from '../restaurant/schemas/addon.shema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';

let mongod: MongoMemoryServer;

describe('MenuService', () => {
  let service: MenuService;
  let categoryModel: Model<Category>;
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
          { name: MenuItems.name, schema: MenuItemsSchema },
          { name: Addon.name, schema: AddonSchema },
          { name: Restaurant.name, schema: RestaurantSchema },
        ]),
      ],
      providers: [MenuService, Mongoose],
    }).compile();

    service = module.get<MenuService>(MenuService);
    categoryModel = module.get<Model<Category>>('CategoryModel');
    restaurantModel = module.get<Model<Restaurant>>('RestaurantModel');
  });

  const categoryId = Types.ObjectId('60c51b3d9345459e3ac60d5d');
  const restaurantId = Types.ObjectId('60c5165a27ab938e4f96e49f');

  const name = 'green tea';
  const pictureUrl =
    'https://images.wallpaperscraft.ru/image/chay_listya_chashka_71596_2560x1600.jpg';
  const price = '0.1';
  const weight = '200';
  const time = '3';
  const description = 'Regular green tea';
  const createMenuItems = async () => {
    const restaurant = new restaurantModel({
      _id: restaurantId,
      actions: [],
      tables: [],
      currencyCode: 'USD',
      name: 'Bit Adventure 2',
    });
    const category = new categoryModel({
      _id: categoryId,
      name: 'tea',
      restaurant: restaurant,
    });

    return await service.create(
      {
        name: name,
        pictureUrl: pictureUrl,
        price: price,
        weight: weight,
        time: time,
        description: description,
        addons: [],
      },
      category,
    );
  };

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should create new menu items', async () => {
    const menuItems = await createMenuItems();

    expect(menuItems).toBeDefined();
    expect(menuItems._id).toBeDefined();
    expect(menuItems.name).toBe(name);
    expect(menuItems.pictureUrl).toBe(pictureUrl);
    expect(menuItems.price).toBe(price);
    expect(menuItems.weight).toBe(weight);
    expect(menuItems.time).toBe(time);
    expect(menuItems.description).toBe(description);
    expect(menuItems.category._id).toBe(categoryId);
  });

  it('should get all menu items', async () => {
    const menuItems1 = await createMenuItems();
    const menuItems2 = await createMenuItems();

    const allMenuItems = await service.findAll(String(restaurantId));

    expect(allMenuItems).toBeDefined();
    expect(allMenuItems.length).toBe(2);
    expect(allMenuItems[0].name).toStrictEqual(menuItems1.name);
    expect(allMenuItems[0].pictureUrl).toBe(pictureUrl);
    expect(allMenuItems[0].price).toStrictEqual(menuItems1.price);
    expect(allMenuItems[0].weight).toStrictEqual(menuItems1.weight);
    expect(allMenuItems[0].time).toStrictEqual(menuItems1.time);
    expect(allMenuItems[0].description).toStrictEqual(menuItems1.description);
    expect(allMenuItems[0].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[1].name).toStrictEqual(menuItems2.name);
    expect(allMenuItems[1].pictureUrl).toBe(pictureUrl);
    expect(allMenuItems[1].price).toStrictEqual(menuItems2.price);
    expect(allMenuItems[1].weight).toStrictEqual(menuItems2.weight);
    expect(allMenuItems[1].time).toStrictEqual(menuItems2.time);
    expect(allMenuItems[1].description).toStrictEqual(menuItems2.description);
    expect(allMenuItems[1].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[0]._id).not.toBe(allMenuItems[1]._id);
  });

  it('should return menuItems by id', async () => {
    const creatMenuItems = await createMenuItems();

    const findMenuItems = await service.findById(creatMenuItems._id);

    expect(findMenuItems).toBeDefined();
    expect(findMenuItems.name).toStrictEqual(creatMenuItems.name);
    expect(findMenuItems.pictureUrl).toBe(pictureUrl);
    expect(findMenuItems.price).toStrictEqual(creatMenuItems.price);
    expect(findMenuItems.weight).toStrictEqual(creatMenuItems.weight);
    expect(findMenuItems.time).toStrictEqual(creatMenuItems.time);
    expect(findMenuItems.description).toStrictEqual(creatMenuItems.description);
    expect(findMenuItems.category.restaurant._id).toStrictEqual(restaurantId);
  });

  it('should return all menu Items by category id', async () => {
    const menuItems1 = await createMenuItems();
    const menuItems2 = await createMenuItems();

    const allMenuItems = await service.findByCategoryId(String(categoryId));

    expect(allMenuItems).toBeDefined();
    expect(allMenuItems.length).toBe(2);
    expect(allMenuItems[0].name).toStrictEqual(menuItems1.name);
    expect(allMenuItems[0].pictureUrl).toBe(pictureUrl);
    expect(allMenuItems[0].price).toStrictEqual(menuItems1.price);
    expect(allMenuItems[0].weight).toStrictEqual(menuItems1.weight);
    expect(allMenuItems[0].time).toStrictEqual(menuItems1.time);
    expect(allMenuItems[0].description).toStrictEqual(menuItems1.description);
    expect(allMenuItems[0].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[1].name).toStrictEqual(menuItems2.name);
    expect(allMenuItems[1].pictureUrl).toBe(pictureUrl);
    expect(allMenuItems[1].price).toStrictEqual(menuItems2.price);
    expect(allMenuItems[1].weight).toStrictEqual(menuItems2.weight);
    expect(allMenuItems[1].time).toStrictEqual(menuItems2.time);
    expect(allMenuItems[1].description).toStrictEqual(menuItems2.description);
    expect(allMenuItems[1].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[0]._id).not.toBe(allMenuItems[1]._id);
  });

  it('should return a certain amount of menu item', async () => {
    await createMenuItems();
    const menuItems2 = await createMenuItems();
    const menuItems3 = await createMenuItems();

    const page = 1;
    const menuItems = await service.findByCategoryIdInLimit(
      String(categoryId),
      page,
      2,
    );

    expect(menuItems).toBeDefined();
    expect(menuItems.items.length).toBe(2);
    expect(menuItems.totalPages).toStrictEqual(3);
    expect(menuItems.items[0].pictureUrl).toBe(pictureUrl);
    expect(menuItems.items[0].price).toStrictEqual(menuItems2.price);
    expect(menuItems.items[0].weight).toStrictEqual(menuItems2.weight);
    expect(menuItems.items[0].time).toStrictEqual(menuItems2.time);
    expect(menuItems.items[0].description).toStrictEqual(
      menuItems2.description,
    );
    expect(menuItems.items[0].category.restaurant._id).toStrictEqual(
      restaurantId,
    );
    expect(menuItems.items[1].name).toStrictEqual(menuItems3.name);
    expect(menuItems.items[1].pictureUrl).toBe(pictureUrl);
    expect(menuItems.items[1].price).toStrictEqual(menuItems3.price);
    expect(menuItems.items[1].weight).toStrictEqual(menuItems3.weight);
    expect(menuItems.items[1].time).toStrictEqual(menuItems3.time);
    expect(menuItems.items[1].description).toStrictEqual(
      menuItems3.description,
    );
    expect(menuItems.items[1].category.restaurant._id).toStrictEqual(
      restaurantId,
    );
    expect(menuItems.items[0]._id).not.toBe(menuItems.items[1]._id);
  });
});
