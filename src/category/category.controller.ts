import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Res() res) {
    try {
      const category = await this.categoryService.create(createCategoryDto);
      return res.status(HttpStatus.OK).json(category);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':restaurantId')
  async findAll(@Param('restaurantId') restaurantId: string, @Res() res) {
    try {
      const allCategories = await this.categoryService.findAll(restaurantId);
      return res.status(HttpStatus.OK).json(allCategories);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
