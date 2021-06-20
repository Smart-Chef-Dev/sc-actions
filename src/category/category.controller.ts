import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';

import { MenuService } from '../menu/menu.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':id/menuItems')
  async findMenuItemsByIdCategory(@Res() res, @Param('id') id: string) {
    try {
      const menuItems = await this.menuService.findByIdCategory(id);
      return res.status(HttpStatus.OK).json(menuItems);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
