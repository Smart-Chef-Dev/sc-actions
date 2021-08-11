import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

import { Category, CategorySchema } from 'src/category/schemas/category.schema';
import { MenuItems, MenuItemsSchema } from './schemas/menuItems.shema';
import { Addon, AddonSchema } from '../restaurant/schemas/addon.shema';
import { ImagesService } from '../images/images.service';
import { CategoryService } from '../category/category.service';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { Action, ActionSchema } from '../restaurant/schemas/action.schema';
import { Table, TableSchema } from '../restaurant/schemas/table.schema';
import { Analytic, AnalyticSchema } from '../analytics/schemas/analytic.schema';
import { Users, UsersSchema } from '../users/schemas/users.schema';
import { UsersModule } from '../users/users.module';
import { RestaurantService } from '../restaurant/restaurant.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Table.name, schema: TableSchema },
      { name: Analytic.name, schema: AnalyticSchema },
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: MenuItemsSchema },
      { name: Addon.name, schema: AddonSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
    UsersModule,
  ],
  providers: [MenuService, ImagesService, CategoryService, RestaurantService],
  exports: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
