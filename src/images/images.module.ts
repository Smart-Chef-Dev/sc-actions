import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { HelperFunctionsModule } from '../helper-functions/helper-functions.module';

@Module({
  imports: [RestaurantModule, ConfigModule, HelperFunctionsModule],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
