import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Category, CategorySchema } from './schemas/category.schema';
import { Course, CourseSchema } from './schemas/course.shema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';

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
          { name: Restaurant.name, schema: RestaurantSchema },
        ]),
      ],
      providers: [MenuService],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
