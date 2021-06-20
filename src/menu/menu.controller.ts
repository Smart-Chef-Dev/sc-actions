import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';

import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':id')
  async findByIdItems(@Res() res, @Param('id') id: string) {
    try {
      const menuItems = await this.menuService.findById(id);
      return res.status(HttpStatus.OK).json(menuItems);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
