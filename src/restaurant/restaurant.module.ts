import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { RestaurantSchema, Restaurant } from './schemas/restaurant.schema';
import { ActionSchema, Action } from './schemas/action.schema';
import { TableSchema, Table } from './schemas/table.schema';

import { AnalyticsModule } from 'src/analytics/analytics.module';
import { MenuModule } from 'src/menu/menu.module';
import { CategoryModule } from 'src/category/category.module';
import { ImagesModule } from 'src/images/images.module';

import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { UsersModule } from '../users/users.module';

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
    ImagesModule,
    forwardRef(() => UsersModule),
  ],
  providers: [RestaurantService, ConfigService],
  controllers: [RestaurantController],
  exports: [RestaurantService],
})
export class RestaurantModule {}
