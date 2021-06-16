import {
  Controller,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Res,
  Get,
} from '@nestjs/common';

import { MenuService } from './menu.service';
import { MenuItemsDto } from './dto/menuItems';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  async create(@Body() courseDto: MenuItemsDto, @Res() res) {
    try {
      const menuItem = await this.menuService.create(courseDto);
      return res.status(HttpStatus.OK).json(menuItem);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }
    }
  }

  @Get(':restaurantId')
  async findAll(@Res() res, @Param('restaurantId') restaurantId: string) {
    try {
      const allMenuItem = await this.menuService.findAll(restaurantId);
      return res.status(HttpStatus.OK).json(allMenuItem);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }
    }
  }
}
