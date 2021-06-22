import {
  Controller,
  Get,
  Post,
  Res,
  Param,
  Body,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mongoose } from 'mongoose';

import { RestaurantService } from './restaurant.service';
import { RestaurantDto } from './dto/restaurant.dto';
import { ActionDto } from './dto/action.dto';
import { TableDto } from './dto/table.dto';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticType } from '../analytics/enums/analytic-type.enum';
import { CreateCategoryDto } from '../category/dto/create-category.dto';
import { CategoryService } from '../category/category.service';
import { MenuItemsDto } from '../menu/dto/menuItems';
import { MenuService } from '../menu/menu.service';
import { CategoryBusinessErrors } from '../shared/errors/category/catrgory.business-errors';
import { MenuBusinessErrors } from '../shared/errors/menu/menu.business-errors';
import { HelperFunctionsService } from '../helper-functions/helper-functions.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService,
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService,
    private readonly categoryService: CategoryService,
    private readonly helperFunctionsService: HelperFunctionsService,
    private readonly menuService: MenuService,
    private readonly mongoose: Mongoose,
  ) {}

  @Get()
  public async findAll(@Res() res) {
    const restaurants = await this.restaurantService.findAll();

    return res.status(HttpStatus.OK).json(restaurants);
  }

  @Get(':id')
  public async findById(@Param('id') id: string, @Res() res) {
    const restaurant = await this.restaurantService.findById(id);

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Post()
  public async create(@Res() res, @Body() dto: RestaurantDto) {
    const restaurant = await this.restaurantService.create(dto);

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Get(':id/action')
  public async getRestaurantActions(@Param('id') id: string, @Res() res) {
    const actions = await this.restaurantService.findAllActions(id);
    await this.analyticsService.create({
      type: AnalyticType.GET_ACTIONS,
      restaurantId: id,
    });

    return res.status(HttpStatus.OK).json(actions);
  }

  @Post(':id/action')
  public async addActionIntoRestaurant(
    @Param('id') id: string,
    @Body() body: ActionDto,
    @Res() res,
  ) {
    const restaurant = await this.restaurantService.addActionIntoRestaurant(
      id,
      body,
    );

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Get(':id/table')
  public async getRestaurantTables(@Param('id') id: string, @Res() res) {
    const tables = await this.restaurantService.findAllTables(id);

    return res
      .status(HttpStatus.OK)
      .json(tables.map((t) => ({ ...t, restaurantId: id })));
  }

  @Post(':id/table')
  public async addTableIntoRestaurant(
    @Param('id') id: string,
    @Body() body: TableDto,
    @Res() res,
  ) {
    const restaurant = await this.restaurantService.addTableIntoRestaurant(
      id,
      body,
    );

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Post('/category')
  async createCategory(@Body() dto: CreateCategoryDto) {
    await this.helperFunctionsService.objectIdValidation(dto.restaurantId);

    const restaurant = await this.restaurantService.findById(dto.restaurantId);

    if (!restaurant) {
      throw new NotFoundException(CategoryBusinessErrors.NotFoundCategory);
    }

    return this.categoryService.create(dto.name, dto.restaurantId);
  }

  @Get(':restaurantId/category')
  async findAllCategory(@Param('restaurantId') restaurantId: string) {
    await this.helperFunctionsService.objectIdValidation(restaurantId);

    return this.categoryService.findAll(restaurantId);
  }

  @Post('/menu-item')
  async createMenuItem(@Body() dto: MenuItemsDto) {
    await this.helperFunctionsService.objectIdValidation(dto.categoryId);

    const category = await this.categoryService.findById(dto.categoryId);

    if (!category) {
      throw new NotFoundException(MenuBusinessErrors.NotFoundCategory);
    }

    return this.menuService.create(dto);
  }

  @Get(':restaurantId/menu-items')
  async findAllMenuItems(@Param('restaurantId') restaurantId: string) {
    await this.helperFunctionsService.objectIdValidation(restaurantId);

    return this.menuService.findAll(restaurantId);
  }
}
