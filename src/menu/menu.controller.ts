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
import { OrderDto } from './dto/order';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  async create(@Body() courseDto: MenuItemsDto, @Res() res) {
    try {
      await this.menuService.create(courseDto);
      return res.status(HttpStatus.OK).json();
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }
    }
  }

  @Get(':restaurantId')
  async findAll(@Res() res, @Param('restaurantId') restaurantId: string) {
    try {
      const category = await this.menuService.findAll(restaurantId);
      return res.status(HttpStatus.OK).json(category);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }
    }
  }

  @Post('sendMessage/:restaurantId/:tableId')
  async sendMessage(
    @Body() orderDto: OrderDto[],
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Res() res,
  ) {
    await this.menuService.sendMessage(orderDto, restaurantId, tableId);
    return res.status(HttpStatus.OK).json();
  }
}
