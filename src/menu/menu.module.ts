import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose } from 'mongoose';
import { join } from 'path';

import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

import { Course, CourseSchema } from './schemas/course.shema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { CategoryModule } from '../category/category.module';
import { CategoryService } from '../category/category.service';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__filename, '../photos'),
    }),
    CategoryModule,
  ],
  controllers: [MenuController],
  providers: [MenuService, Mongoose],
})
export class MenuModule {}
