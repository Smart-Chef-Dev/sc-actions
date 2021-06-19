import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { RestaurantModule } from '../restaurant/restaurant.module';

import { Category, CategorySchema } from './schemas/category.schema';
import { Mongoose } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    forwardRef(() => RestaurantModule),
  ],
  providers: [CategoryService, Mongoose],
  exports: [CategoryService],
})
export class CategoryModule {}
