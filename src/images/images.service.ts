import { BadRequestException, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import * as fs from 'fs';

import { RestaurantService } from '../restaurant/restaurant.service';
import { ImagesBusinessErrors } from '../shared/errors/images/images.business-errors';

@Injectable()
export class ImagesService {
  constructor(private restaurantService: RestaurantService) {}

  async uploadFile(buffer: Uint8Array, restaurantId: string) {
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
    fs.writeFile(
      `client/menuPhotos/${restaurantId}/${fileId}.png`,
      buffer,
      () => {},
    );

    return fileId;
  }
}
