import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ImagesService } from './images.service';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [forwardRef(() => RestaurantModule), ConfigModule],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
