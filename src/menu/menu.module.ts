import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

import { Category, CategorySchema } from 'src/category/schemas/category.schema';
import { MenuItems, MenuItemsSchema } from './schemas/menuItems.shema';
import { Addons, AddonsSchema } from './schemas/addons.shema';
import { ImagesService } from '../images/images.service';
import { CategoryService } from '../category/category.service';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: MenuItemsSchema },
      { name: Addons.name, schema: AddonsSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
  ],
  providers: [MenuService, ImagesService, CategoryService],
  exports: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
