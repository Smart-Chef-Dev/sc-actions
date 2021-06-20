import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import * as fs from 'fs';

import { RestaurantService } from '../restaurant/restaurant.service';
import { ImagesBusinessErrors } from '../shared/errors/images/images.business-errors';

@Injectable()
export class ImagesService {
  constructor(
    private restaurantService: RestaurantService,
    private configService: ConfigService,
  ) {}

  async uploadFile(buffer: Uint8Array, restaurantId: string, typeFile: string) {
    const doesRestaurantExist = await this.restaurantService.findById(
      restaurantId,
    );

    if (!doesRestaurantExist) {
      throw new BadRequestException(ImagesBusinessErrors.NotFoundRestaurant);
    }

    if (!fs.existsSync(`client/menuPhotos/${restaurantId}`)) {
      fs.mkdirSync(`client/menuPhotos/${restaurantId}`);
    }

    const fileId = nanoid();
    const file = `${fileId}.${typeFile}`;
    await fs.writeFileSync(`client/menuPhotos/${restaurantId}/${file}`, buffer);

    return `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/client/menuPhotos/${restaurantId}/${file}`;
  }
}
