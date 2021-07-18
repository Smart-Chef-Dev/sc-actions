import {
  Body,
  Controller,
  Get,
  NotFoundException,
  BadRequestException,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { MenuService } from 'src/menu/menu.service';
import { MenuItemsDto } from 'src/menu/dto/menuItems';
import { checkIsObjectIdValid } from 'src/utils/checkIsObjectIdValid';
import { CategoryService } from './category.service';
import { ConfigService } from '@nestjs/config';
import { ImagesService } from '../images/images.service';

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

    const isCategoryExists = await this.categoryService.findById(id);
    if (!isCategoryExists) {
      throw new NotFoundException();
    }

    const path = dto.pictureUrl.replace(
      `${this.configService.get<string>('FRONTEND_URL')}/`,
      '',
    );
    const isFile = await this.imagesService.checkFileForExistence(path);
    if (!isFile) {
      throw new BadRequestException('invalid photo path');
    }

    return this.menuService.create(dto, id);
  }
}
