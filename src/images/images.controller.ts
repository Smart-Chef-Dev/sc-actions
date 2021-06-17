import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post(':restaurantId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('restaurantId') restaurantId: string,
    @Res() res,
  ) {
    try {
      const fileId = await this.imagesService.uploadFile(
        file.buffer,
        restaurantId,
      );

      return res.status(HttpStatus.OK).json(fileId);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
