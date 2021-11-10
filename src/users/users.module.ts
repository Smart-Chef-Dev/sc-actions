import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UsersSchema } from './schemas/users.schema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { Addon, AddonSchema } from '../restaurant/schemas/addon.shema';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Action, ActionSchema } from '../restaurant/schemas/action.schema';
import { Table, TableSchema } from '../restaurant/schemas/table.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: Addon.name, schema: AddonSchema },
      { name: Action.name, schema: ActionSchema },
      { name: Table.name, schema: TableSchema },
      { name: Users.name, schema: UsersSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [UsersService, JwtModule],
  controllers: [UsersController],
  providers: [UsersService, RestaurantService],
})
export class UsersModule {}
