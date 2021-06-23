import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { MenuService } from '../menu/menu.service';
import { MenuItemsDto } from '../menu/dto/menuItems';
import { checkIsObjectIdValid } from '../utils/checkIsObjectIdValid';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly menuService: MenuService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get(':id/menu-item')
  findMenuItemsByIdCategory(@Param('id') id: string) {
    return this.menuService.findByIdCategory(id);
  }

  @Post(':id/menu-item')
  async createMenuItem(@Body() dto: MenuItemsDto, @Param('id') id: string) {
    await checkIsObjectIdValid(id);

    const isCategoryExists = await this.categoryService.findById(id);
    if (!isCategoryExists) {
      throw new NotFoundException();
    }

    return this.menuService.create(dto, id);
  }
}
