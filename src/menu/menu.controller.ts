import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { MenuService } from './menu.service';
import { CreateCategoryDto } from '../category/dto/create-category.dto';
import { checkIsObjectIdValid } from '../utils/checkIsObjectIdValid';
import { MenuItemsDto } from './dto/menuItems';
import { ImagesService } from '../images/images.service';
import { CategoryService } from '../category/category.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { checkIfUserHasPermissionToChangeRestaurant } from '../utils/checkIfUserHasPermissionToChangeRestaurant';
import { Users } from '../users/schemas/users.schema';
import { JwtGuard } from '../guard/jwt.guard';

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

  @UseGuards(JwtGuard)
  @Post(':menuItemId1/swap/:menuItemId2')
  async swapItem(
    @Body() dto: CreateCategoryDto,
    @Param('menuItemId1') menuItemId1: string,
    @Param('menuItemId2') menuItemId2: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(menuItemId1);
    await checkIsObjectIdValid(menuItemId2);

    const menuItem1 = await this.menuService.findById(menuItemId1);
    if (!menuItem1) {
      throw new NotFoundException(
        `MenuItem with id(${menuItemId1}) does not exist`,
      );
    }

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      menuItem1.category.restaurant._id,
    );

    const menuItem2 = await this.menuService.findById(menuItemId2);
    if (!menuItem2) {
      throw new NotFoundException(
        `MenuItem with id(${menuItemId2}) does not exist`,
      );
    }

    await this.menuService.updateById(menuItem1._id, { n: menuItem2.n });
    await this.menuService.updateById(menuItem2._id, { n: menuItem1.n });
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async removeMenuItem(@Param('id') menuItemId: string, @Req() req) {
    const user: Users = req.user;
    await checkIsObjectIdValid(menuItemId);

    const menuItem = await this.menuService.findById(menuItemId);
    if (!menuItem) {
      throw new NotFoundException(
        `MenuItem with id(${menuItemId}) does not exist`,
      );
    }

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      menuItem.category.restaurant._id,
    );

    return this.menuService.removeMenuItem(menuItemId);
  }

  @UseGuards(JwtGuard)
  @Post(':id/update')
  async updateById(
    @Body() dto: MenuItemsDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(id);
    await checkIsObjectIdValid(dto.categoryId);

    if (!dto.categoryId) {
      throw new BadRequestException('The request body must have categoryId');
    }

    const menuItem = await this.menuService.findById(id);
    if (!menuItem) {
      throw new NotFoundException();
    }

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      menuItem.category.restaurant._id,
    );

    const isPictureExists = await this.imagesService.checkPhotoForExistence(
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

  @UseGuards(JwtGuard)
  @Post(':menuItemId/addon/:addonId')
  async addAddon(
    @Param('menuItemId') menuItemId: string,
    @Param('addonId') addonId: string,
    @Req() req,
  ) {
    const user: Users = req.user;
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

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      menuItem.category.restaurant._id,
    );

    const addonExistInMenuItem = await menuItem.addons.find(
      (a) => a._id === addonId,
    );
    if (addonExistInMenuItem) {
      return;
    }

    return this.menuService.updateById(menuItemId, {
      $push: {
        addons: addon,
      },
    });
  }
}
