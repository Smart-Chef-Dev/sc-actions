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
import { CourseDto } from './dto/course';
import { OrderDto } from './dto/order';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post(':restaurantId/addCourses')
  async addCourse(
    @Param('restaurantId') restaurantId: string,
    @Body() courseDto: CourseDto,
    @Res() res,
  ) {
    try {
      await this.menuService.addCourse(courseDto, restaurantId);
      return res.status(HttpStatus.OK).json();
    } catch (err) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':restaurantId/getCourse')
  async getCourse(@Res() res, @Param('restaurantId') restaurantId: string) {
    try {
      const category = await this.menuService.getCourse(restaurantId);
      return res.status(HttpStatus.OK).json(category);
    } catch (err) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
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
