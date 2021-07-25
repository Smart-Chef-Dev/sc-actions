import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductsStripeService } from './products-stripe.service';
import { ProductsStripeController } from './products-stripe.controller';
import { UsersModule } from '../users/users.module';
import { Users, UsersSchema } from '../users/schemas/users.schema';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
    UsersModule,
  ],
  controllers: [ProductsStripeController],
  providers: [ProductsStripeService, UsersService],
})
export class ProductsStripeModule {}
