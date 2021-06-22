import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';

import { ImagesService } from './images.service';
import { ImagesBusinessErrors } from '../shared/errors/images/images.business-errors';
import { RestaurantService } from '../restaurant/restaurant.service';
import { objectIdValidation } from '../helper-functions/objectIdValidation';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private restaurantService: RestaurantService,
    private configService: ConfigService,
  ) {}

  @Post(':restaurantId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('restaurantId') restaurantId: string,
  ) {
    await objectIdValidation(restaurantId);

    const doesRestaurantExist = await this.restaurantService.findById(
      restaurantId,
    );

    if (!doesRestaurantExist) {
      throw new BadRequestException(ImagesBusinessErrors.NotFoundRestaurant);
    }

    const typeFile = path.extname(file.originalname);
    const pathFile = `${this.configService.get<string>(
      'PATH_PHOTOS_MENU',
    )}/${restaurantId}/${nanoid()}${typeFile}`;

    await this.imagesService.createDirectory(
      `${this.configService.get<string>('PATH_PHOTOS_MENU')}/${restaurantId}`,
    );
    await this.imagesService.saveFile(pathFile, file.buffer);

    return `${this.configService.get<string>('FRONTEND_URL')}/${pathFile}`;
  }
}
