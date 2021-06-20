import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongoose, Types } from 'mongoose';
import { join } from 'path';

import { MenuService } from './menu.service';

import { Category, CategorySchema } from '../category/schemas/category.schema';
import { MenuItems, MenuItemsSchema } from './schemas/menuItems.shema';
import { CategoryService } from '../category/category.service';

let mongod: MongoMemoryServer;

describe('MenuService', () => {
  let service: MenuService;
  let categoryService: CategoryService;

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
        ]),
        ServeStaticModule.forRoot({
          rootPath: join(__filename, '../photos'),
        }),
      ],
      providers: [
        MenuService,
        Mongoose,
        {
          provide: CategoryService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    categoryService = module.get<CategoryService>(CategoryService);
  });

  const categoryId = Types.ObjectId('60c51b3d9345459e3ac60d5d');
  const restaurantId = Types.ObjectId('60c5165a27ab938e4f96e49f');
  beforeEach(() => {
    categoryService.findById = jest.fn().mockReturnValue({
      _id: categoryId,
      category: 'teas',
      restaurant: {
        _id: restaurantId,
        actions: [],
        tables: [],
        usernames: [],
        name: 'Bit Adventure 2',
      },
    });
  });

  const name = 'green tea';
  const pictureUrl =
    '"http://localhost:3000/client/menuPhotos/60ca9434728fea71f83b5f3f/_wTKrQUmgDataCxYvs4ZR.svg"';
  const price = '0.1';
  const weight = '200';
  const time = '3';
  const description = 'Regular green tea';
  const createMenuItems = async () => {
    return await service.create({
      name: name,
      pictureUrl: pictureUrl,
      price: price,
      weight: weight,
      time: time,
      description: description,
      categoryId: String(categoryId),
    });
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

    const allMenuItems = await service.findByIdCategory(String(categoryId));

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
});
