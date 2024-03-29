import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongoose, Types, Model } from 'mongoose';
import * as mongoose from 'mongoose';

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
  let module: TestingModule;
  let service: MenuService;
  let categoryModel: Model<Category>;
  let restaurantModel: Model<Restaurant>;

  afterEach(async () => {
    await module.close();
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    mongod = new MongoMemoryServer();

    module = await Test.createTestingModule({
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

  const name = 'Pork shashlik';
  const pictureUrl =
    'https://images.wallpaperscraft.ru/image/single/chay_zelenyy_listochki_myata_84998_1600x900.jpg';
  const price = 0.1;
  const weight = 200;
  const time = 3;
  const description = 'Regular green tea';
  const createMenuItem = async () => {
    const restaurant = new restaurantModel({
      _id: restaurantId,
      actions: [],
      tables: [],
      currencyCode: 'USD',
      name: 'Bit Adventure 2',
    });
    const category = new categoryModel({
      _id: categoryId,
      name: 'shashliks',
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
        categoryId: String(categoryId),
        addons: [
          {
            name: 'Cоус1',
            price: 3,
          },
          {
            name: 'Cоус2',
            price: 5,
          },
        ],
      },
      category,
    );
  };

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should create new menu items', async () => {
    const menuItems = await createMenuItem();

    expect(menuItems).toBeDefined();
    expect(menuItems._id).toBeDefined();
    expect(menuItems.name).toBe(name);
    expect(menuItems.price).toBe(price);
    expect(menuItems.weight).toBe(weight);
    expect(menuItems.time).toBe(time);
    expect(menuItems.description).toBe(description);
    expect(menuItems.category._id).toBe(categoryId);
  });

  it('should get all menu items', async () => {
    const menuItems1 = await createMenuItem();
    const menuItems2 = await createMenuItem();

    const allMenuItems = await service.findAll(String(restaurantId));

    expect(allMenuItems).toBeDefined();
    expect(allMenuItems.length).toBe(2);
    expect(allMenuItems[0].name).toStrictEqual(menuItems1.name);
    expect(allMenuItems[0].price).toStrictEqual(menuItems1.price);
    expect(allMenuItems[0].weight).toStrictEqual(menuItems1.weight);
    expect(allMenuItems[0].time).toStrictEqual(menuItems1.time);
    expect(allMenuItems[0].description).toStrictEqual(menuItems1.description);
    expect(allMenuItems[0].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[1].name).toStrictEqual(menuItems2.name);
    expect(allMenuItems[1].price).toStrictEqual(menuItems2.price);
    expect(allMenuItems[1].weight).toStrictEqual(menuItems2.weight);
    expect(allMenuItems[1].time).toStrictEqual(menuItems2.time);
    expect(allMenuItems[1].description).toStrictEqual(menuItems2.description);
    expect(allMenuItems[1].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[0]._id).not.toBe(allMenuItems[1]._id);
  }, 7000);

  it('should return menuItems by id', async () => {
    const creatMenuItems = await createMenuItem();

    const findMenuItems = await service.findById(creatMenuItems._id);

    expect(findMenuItems).toBeDefined();
    expect(findMenuItems.name).toStrictEqual(creatMenuItems.name);
    expect(findMenuItems.price).toStrictEqual(creatMenuItems.price);
    expect(findMenuItems.weight).toStrictEqual(creatMenuItems.weight);
    expect(findMenuItems.time).toStrictEqual(creatMenuItems.time);
    expect(findMenuItems.description).toStrictEqual(creatMenuItems.description);
    expect(findMenuItems.category.restaurant._id).toStrictEqual(restaurantId);
  });

  it('should return all menu Items by category id', async () => {
    const menuItems1 = await createMenuItem();
    const menuItems2 = await createMenuItem();

    const allMenuItems = await service.findByCategoryId(String(categoryId));

    expect(allMenuItems).toBeDefined();
    expect(allMenuItems.length).toBe(2);
    expect(allMenuItems[0].name).toStrictEqual(menuItems1.name);
    expect(allMenuItems[0].price).toStrictEqual(menuItems1.price);
    expect(allMenuItems[0].weight).toStrictEqual(menuItems1.weight);
    expect(allMenuItems[0].time).toStrictEqual(menuItems1.time);
    expect(allMenuItems[0].description).toStrictEqual(menuItems1.description);
    expect(allMenuItems[0].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[1].name).toStrictEqual(menuItems2.name);
    expect(allMenuItems[1].price).toStrictEqual(menuItems2.price);
    expect(allMenuItems[1].weight).toStrictEqual(menuItems2.weight);
    expect(allMenuItems[1].time).toStrictEqual(menuItems2.time);
    expect(allMenuItems[1].description).toStrictEqual(menuItems2.description);
    expect(allMenuItems[1].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[0]._id).not.toBe(allMenuItems[1]._id);
  });

  it('should return a certain amount of menu item', async () => {
    await createMenuItem();
    const menuItems2 = await createMenuItem();
    const menuItems3 = await createMenuItem();

    const page = 1;
    const menuItems = await service.findByCategoryIdInLimit(
      String(categoryId),
      page,
      2,
    );

    expect(menuItems).toBeDefined();
    expect(menuItems.items.length).toBe(2);
    expect(menuItems.totalPages).toStrictEqual(3);
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
  }, 7000);

  it('should remove the menuItem', async () => {
    const menuItem = await createMenuItem();

    await service.removeMenuItem(menuItem._id);
    const foundMenuItem = await service.findById(menuItem._id);

    expect(foundMenuItem).toBe(null);
  });

  it('should update menuItem', async () => {
    const menuItem = await createMenuItem();

    const newName = 'chamomile tea';
    const newPrice = 15;
    const newTime = 2;
    const newDescription = 'Delicious chamomile tea';
    const updatedMenuItem = await service.updateById(menuItem._id, {
      name: newName,
      price: newPrice,
      time: newTime,
      description: newDescription,
    });

    expect(updatedMenuItem).toBeDefined();
    expect(updatedMenuItem._id).toStrictEqual(menuItem._id);
    expect(updatedMenuItem.name).toBe(newName);
    expect(updatedMenuItem.price).toBe(newPrice);
    expect(updatedMenuItem.time).toBe(newTime);
    expect(updatedMenuItem.description).toBe(newDescription);
  });
});
