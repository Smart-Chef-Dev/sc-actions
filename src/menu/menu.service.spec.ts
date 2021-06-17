import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongoose } from 'mongoose';
import { join } from 'path';

import { MenuService } from './menu.service';

import { Category, CategorySchema } from '../category/schemas/category.schema';
import { Course, CourseSchema } from './schemas/menuItems.shema';
import { CategoryService } from '../category/category.service';

let mongod: MongoMemoryServer;
let mongoose = require('mongoose');

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
          { name: Course.name, schema: CourseSchema },
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

  const categoryId = mongoose.Types.ObjectId('60c51b3d9345459e3ac60d5d');
  const restaurantId = mongoose.Types.ObjectId('60c5165a27ab938e4f96e49f');
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
  const pictureUrl = 'http://localhost:3000/pancake.png';
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
      categoryId: categoryId,
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

    const allMenuItems = await service.findAll(restaurantId);

    expect(allMenuItems).toBeDefined();
    expect(allMenuItems.length).toBe(2);
    expect(allMenuItems[0].name).toStrictEqual(menuItems1.name);
    expect(allMenuItems[0].pictureUrl).toStrictEqual(menuItems1.pictureUrl);
    expect(allMenuItems[0].price).toStrictEqual(menuItems1.price);
    expect(allMenuItems[0].weight).toStrictEqual(menuItems1.weight);
    expect(allMenuItems[0].time).toStrictEqual(menuItems1.time);
    expect(allMenuItems[0].description).toStrictEqual(menuItems1.description);
    expect(allMenuItems[0].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[1].name).toStrictEqual(menuItems2.name);
    expect(allMenuItems[1].pictureUrl).toStrictEqual(menuItems2.pictureUrl);
    expect(allMenuItems[1].price).toStrictEqual(menuItems2.price);
    expect(allMenuItems[1].weight).toStrictEqual(menuItems2.weight);
    expect(allMenuItems[1].time).toStrictEqual(menuItems2.time);
    expect(allMenuItems[1].description).toStrictEqual(menuItems2.description);
    expect(allMenuItems[1].category.restaurant._id).toStrictEqual(restaurantId);
    expect(allMenuItems[0]._id).not.toBe(allMenuItems[1]._id);
  });
});
