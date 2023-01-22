import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductsStripeService } from './products-stripe.service';
import { ProductsStripeController } from './products-stripe.controller';
import { UsersModule } from '../users/users.module';
import { Users, UsersSchema } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { Action, ActionSchema } from '../restaurant/schemas/action.schema';
import { Table, TableSchema } from '../restaurant/schemas/table.schema';
import { Addon, AddonSchema } from '../restaurant/schemas/addon.shema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Table.name, schema: TableSchema },
      { name: Addon.name, schema: AddonSchema },
    ]),
    UsersModule,
  ],
  controllers: [ProductsStripeController],
  providers: [ProductsStripeService, UsersService, RestaurantService],
})
export class ProductsStripeModule {}
