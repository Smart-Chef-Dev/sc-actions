import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mongoose } from 'mongoose';

import { MenuService } from './menu.service';

import { MenuItems, CourseSchema } from './schemas/menuItems.shema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: CourseSchema },
    ]),
    CategoryModule,
  ],
  providers: [MenuService, Mongoose],
  exports: [MenuService],
})
export class MenuModule {}
