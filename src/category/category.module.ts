import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

import { Category, CategorySchema } from './schemas/category.schema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { MenuService } from '../menu/menu.service';
import { MenuItems, MenuItemsSchema } from '../menu/schemas/menuItems.shema';
import { Addon, AddonSchema } from '../restaurant/schemas/addon.shema';
import { ImagesService } from '../images/images.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: MenuItemsSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Addon.name, schema: AddonSchema },
    ]),
    UsersModule,
  ],
  providers: [CategoryService, MenuService, ImagesService],
  exports: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
