import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { MenuModule } from 'src/menu/menu.module';

import { Category, CategorySchema } from './schemas/category.schema';
import { ConfigService } from '@nestjs/config';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    forwardRef(() => RestaurantModule),
    forwardRef(() => MenuModule),
    ImagesModule,
  ],
  providers: [CategoryService, ConfigService],
  exports: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
