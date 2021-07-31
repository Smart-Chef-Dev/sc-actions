import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MenuService } from 'src/menu/menu.service';
import { MenuItemsDto } from 'src/menu/dto/menuItems';
import { checkIsObjectIdValid } from 'src/utils/checkIsObjectIdValid';
import { CategoryService } from './category.service';
import { ImagesService } from 'src/images/images.service';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly menuService: MenuService,
    private readonly categoryService: CategoryService,
    private readonly configService: ConfigService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get(':id/menu-item')
  async findMenuItemsByIdCategory(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    await checkIsObjectIdValid(id);

    const isCategoryExists = await this.categoryService.findById(id);
    if (!isCategoryExists) {
      throw new NotFoundException();
    }

    return !!page && !!limit
      ? this.menuService.findByCategoryIdInLimit(id, page, limit)
      : this.menuService.findByCategoryId(id);
  }

  @Post(':id/menu-item')
  async createMenuItem(@Body() dto: MenuItemsDto, @Param('id') id: string) {
    await checkIsObjectIdValid(id);

    const category = await this.categoryService.findById(id);
    if (!category) {
      throw new NotFoundException();
    }

    const isPictureExists = await this.imagesService.checkFileForExistence(
      dto.pictureUrl,
    );
    if (!isPictureExists) {
      throw new NotFoundException('Image not found');
    }

    return this.menuService.create(dto, category, dto.pictureUrl);
  }
}
