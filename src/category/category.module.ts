import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { RestaurantModule } from '../restaurant/restaurant.module';

import { Category, CategorySchema } from './schemas/category.schema';
import { CategoryController } from './category.controller';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    forwardRef(() => RestaurantModule),
    forwardRef(() => MenuModule),
  ],
  providers: [CategoryService],
  exports: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
