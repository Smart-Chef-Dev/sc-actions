import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { RestaurantSchema, Restaurant } from './schemas/restaurant.schema';
import { ActionSchema, Action } from './schemas/action.schema';
import { TableSchema, Table } from './schemas/table.schema';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { AnalyticsModule } from '../analytics/analytics.module';
import { MenuModule } from '../menu/menu.module';
import { CategoryModule } from '../category/category.module';
import { Mongoose } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Table.name, schema: TableSchema },
    ]),
    AnalyticsModule,
    CategoryModule,
    MenuModule,
  ],
  providers: [RestaurantService, ConfigService, Mongoose],
  controllers: [RestaurantController],
  exports: [RestaurantService],
})
export class RestaurantModule {}
