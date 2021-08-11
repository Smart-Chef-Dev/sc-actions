import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { MenuService } from './menu.service';
import { CreateCategoryDto } from '../category/dto/create-category.dto';
import { checkIsObjectIdValid } from '../utils/checkIsObjectIdValid';
import { MenuItemsDto } from './dto/menuItems';
import { ImagesService } from '../images/images.service';
import { CategoryService } from '../category/category.service';
import { RestaurantService } from '../restaurant/restaurant.service';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly imagesService: ImagesService,
    private readonly categoryService: CategoryService,
    private restaurantService: RestaurantService,
  ) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.menuService.findById(id);
  }

  @Post(':menuItemId1/swap/:menuItemId2')
  async changeItemNumber(
    @Body() dto: CreateCategoryDto,
    @Param('menuItemId1') menuItemId1: string,
    @Param('menuItemId2') menuItemId2: string,
  ) {
    await checkIsObjectIdValid(menuItemId1);
    await checkIsObjectIdValid(menuItemId2);

    const menuItem1 = await this.menuService.findById(menuItemId1);
    if (!menuItem1) {
      throw new NotFoundException(
        `MenuItem with id(${menuItemId1}) does not exist`,
      );
    }

    const menuItem2 = await this.menuService.findById(menuItemId2);
    if (!menuItem2) {
      throw new NotFoundException(
        `MenuItem with id(${menuItemId2}) does not exist`,
      );
    }

    return this.menuService.swapMenuItems(menuItem1, menuItem2);
  }

  @Delete(':id')
  async removeMenuItem(@Param('id') menuItemId: string) {
    await checkIsObjectIdValid(menuItemId);

    const menuItem = await this.menuService.findById(menuItemId);
    if (!menuItem) {
      throw new NotFoundException(
        `MenuItem with id(${menuItemId}) does not exist`,
      );
    }

    return this.menuService.removeMenuItem(menuItemId);
  }

  @Post(':id/update')
  async updateById(@Body() dto: MenuItemsDto, @Param('id') id: string) {
    await checkIsObjectIdValid(id);
    await checkIsObjectIdValid(dto.categoryId);

    console.log(dto);

    if (!dto.categoryId) {
      throw new BadRequestException('The request body must have categoryId');
    }

    const menuItem = await this.menuService.findById(id);
    if (!menuItem) {
      throw new NotFoundException();
    }

    const isPictureExists = await this.imagesService.checkFileForExistence(
      dto.pictureUrl,
    );
    if (!isPictureExists && dto.pictureUrl) {
      throw new NotFoundException('Image not found');
    }

    const category = await this.categoryService.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.menuService.updateById(id, { ...dto, category });
  }

  @Post(':menuItemId/addon/:addonId')
  async addAddon(
    @Param('menuItemId') menuItemId: string,
    @Param('addonId') addonId: string,
  ) {
    await checkIsObjectIdValid(menuItemId);
    await checkIsObjectIdValid(addonId);

    const addon = await this.restaurantService.findAddonById(addonId);
    if (!addon) {
      throw new NotFoundException('Addon not found');
    }

    const menuItem = await this.menuService.findById(menuItemId);
    if (!menuItem) {
      throw new NotFoundException('MenuItem not found');
    }

    const addonExistInMenuItem = await menuItem.addons.find((a) =>
      a._id.equals(addonId),
    );
    if (addonExistInMenuItem) {
      throw new NotFoundException('Addon has already been added to menu Item');
    }

    return this.menuService.updateById(menuItemId, {
      $push: {
        addons: addon,
      },
    });
  }
}
