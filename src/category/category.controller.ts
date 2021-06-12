import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Res() res) {
    await this.categoryService.create(createCategoryDto);

    return res.status(HttpStatus.OK).json();
  }

  @Get(':restaurantId')
  async findAll(@Param('restaurantId') restaurantId: string, @Res() res) {
    const restaurants = await this.categoryService.findAll(restaurantId);

    return res.status(HttpStatus.OK).json(restaurants);
  }
}
