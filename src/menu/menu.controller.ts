import {
  Controller,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';

import { MenuService } from './menu.service';
import { CourseDto } from './dto/course';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post(':categoryName/addCategory')
  async addCategory(@Param('categoryName') categoryName: string, @Res() res) {
    try {
      await this.menuService.addCategory(categoryName);
      return res.status(HttpStatus.OK).json();
    } catch (err) {
      throw new HttpException(
        'This category already exists',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post(':categoryName/addCourses')
  async addCourses(
    @Param('categoryName') categoryName: string,
    @Body() courseDto: CourseDto,
    @Res() res,
  ) {
    try {
      await this.menuService.addCourses(courseDto, categoryName);
      return res.status(HttpStatus.OK).json();
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.NOT_FOUND);
    }
  }
}
