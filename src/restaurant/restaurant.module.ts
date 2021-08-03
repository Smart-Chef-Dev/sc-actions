import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { RestaurantSchema, Restaurant } from './schemas/restaurant.schema';
import { ActionSchema, Action } from './schemas/action.schema';
import { TableSchema, Table } from './schemas/table.schema';

import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { CategoryService } from 'src/category/category.service';
import { MenuService } from 'src/menu/menu.service';
import { ImagesService } from 'src/images/images.service';
import { UsersService } from '../users/users.service';
import { Analytic, AnalyticSchema } from '../analytics/schemas/analytic.schema';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import { MenuItems, MenuItemsSchema } from '../menu/schemas/menuItems.shema';
import { Addons, AddonsSchema } from '../menu/schemas/addons.shema';
import { Users, UsersSchema } from '../users/schemas/users.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Table.name, schema: TableSchema },
      { name: Analytic.name, schema: AnalyticSchema },
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: MenuItemsSchema },
      { name: Addons.name, schema: AddonsSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
    UsersModule,
  ],
  providers: [
    RestaurantService,
    ConfigService,
    AnalyticsService,
    CategoryService,
    MenuService,
    ImagesService,
    UsersService,
  ],
  controllers: [RestaurantController],
  exports: [RestaurantService],
})
export class RestaurantModule {}
