import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose } from 'mongoose';

import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

import { Course, CourseSchema } from './schemas/course.shema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    CategoryModule,
  ],
  controllers: [MenuController],
  providers: [MenuService, Mongoose],
})
export class MenuModule {}
