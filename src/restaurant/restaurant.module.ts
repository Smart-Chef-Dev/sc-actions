import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { RestaurantSchema, Restaurant } from './schemas/restaurant.schema';
import { ActionSchema, Action } from './schemas/action.schema';
import { TableSchema, Table } from './schemas/table.schema';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { QrCodeService } from '../qr-code/qr-code.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Table.name, schema: TableSchema },
    ]),
  ],
  providers: [RestaurantService, ConfigService, QrCodeService],
  controllers: [RestaurantController],
  exports: [RestaurantService],
})
export class RestaurantModule {}
