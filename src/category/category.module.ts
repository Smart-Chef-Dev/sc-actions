import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { RestaurantModule } from '../restaurant/restaurant.module';

import { Category, CategorySchema } from './schemas/category.schema';
import { Mongoose } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    RestaurantModule,
  ],
  providers: [CategoryService, Mongoose],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
