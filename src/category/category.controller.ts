import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { MenuService } from 'src/menu/menu.service';
import { CategoryService } from './category.service';
import { ImagesService } from 'src/images/images.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtGuard } from '../guard/jwt.guard';
import { Users } from '../users/schemas/users.schema';
import { checkIfUserHasPermissionToChangeRestaurant } from '../utils/checkIfUserHasPermissionToChangeRestaurant';
import { MenuItemsDto } from 'src/menu/dto/menuItems';
import { checkIsObjectIdValid } from 'src/utils/checkIsObjectIdValid';
import { RestaurantService } from '../restaurant/restaurant.service';
import { ScBusinessExceptionFilter } from '../exception-filters/sc-business-exception.filter';

@UseFilters(new ScBusinessExceptionFilter())
@Controller('category')
export class CategoryController {
  constructor(
    private readonly menuService: MenuService,
    private readonly categoryService: CategoryService,
    private readonly imagesService: ImagesService,
    private readonly restaurantService: RestaurantService,
  ) {}

  @Get(':id/menu-item')
  async findMenuItemsByIdCategory(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    await checkIsObjectIdValid(id);

    const category = await this.categoryService.findById(id);
    if (!category) {
      throw new NotFoundException();
    }
    await this.restaurantService.checkingIfRestaurantIsBlocked(
      category.restaurant._id,
    );

    return !!page && !!limit
      ? this.menuService.findByCategoryIdInLimit(id, page, limit)
      : this.menuService.findByCategoryId(id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/menu-item')
  async createMenuItem(
    @Body() dto: MenuItemsDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(id);

    const category = await this.categoryService.findById(id);
    if (!category) {
      throw new NotFoundException();
    }

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      category.restaurant._id,
    );

    const isPictureExists = await this.imagesService.checkFileForExistence(
      dto.pictureUrl,
    );
    if (!isPictureExists) {
      throw new NotFoundException('Image not found');
    }

    return this.menuService.create(dto, category);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async removeCategory(@Param('id') id: string, @Req() req) {
    const user: Users = req.user;
    await checkIsObjectIdValid(id);

    const category = await this.categoryService.findById(id);
    if (!category) {
      throw new NotFoundException();
    }

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      category.restaurant._id,
    );

    const allCategoryMenuItems = await this.menuService.findByCategoryId(
      category._id,
    );
    for (const menuItem of allCategoryMenuItems) {
      await this.menuService.removeMenuItem(menuItem._id);
    }

    return this.categoryService.removeCategory(id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/update')
  async updateById(
    @Body() dto: CreateCategoryDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(id);

    const category = await this.categoryService.findById(id);
    if (!category) {
      throw new NotFoundException();
    }

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      category.restaurant._id,
    );

    const categoryNameIsAlreadyTakenInRestaurant =
      await this.categoryService.findCategoriesByNameInRestaurant(
        dto.name,
        category.restaurant._id,
      );
    if (categoryNameIsAlreadyTakenInRestaurant) {
      throw new ForbiddenException('Name is already taken');
    }

    return this.categoryService.updateById(id, dto);
  }

  @UseGuards(JwtGuard)
  @Post(':categoryId1/swap/:categoryId2')
  async changeItemNumber(
    @Param('categoryId1') categoryId1: string,
    @Param('categoryId2') categoryId2: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(categoryId1);
    await checkIsObjectIdValid(categoryId2);

    const category1 = await this.categoryService.findById(categoryId1);
    if (!category1) {
      throw new NotFoundException(
        `Categories with id(${category1}) does not exist`,
      );
    }

    await checkIfUserHasPermissionToChangeRestaurant(
      user,
      category1.restaurant._id,
    );

    const category2 = await this.categoryService.findById(categoryId2);
    if (!category2) {
      throw new NotFoundException(
        `Categories with id(${category2}) does not exist`,
      );
    }

    await this.categoryService.updateById(category1._id, {
      order: category2.order,
    });
    await this.categoryService.updateById(category2._id, {
      order: category1.order,
    });
  }
}
