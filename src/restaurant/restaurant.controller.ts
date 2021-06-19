import {
  Controller,
  Get,
  Post,
  Res,
  Param,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

@Controller('restaurant')
export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService,
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService,
    private readonly categoryService: CategoryService,
    private readonly menuService: MenuService,
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
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Res() res,
  ) {
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

  @Get(':restaurantId/category')
  async findAllCategory(
    @Param('restaurantId') restaurantId: string,
    @Res() res,
  ) {
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

  @Post('/menuItem')
  async createMenuItem(@Body() courseDto: MenuItemsDto, @Res() res) {
    try {
      const menuItem = await this.menuService.create(courseDto);
      return res.status(HttpStatus.OK).json(menuItem);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':restaurantId/menuItems')
  async findAllMenuItems(
    @Res() res,
    @Param('restaurantId') restaurantId: string,
  ) {
    try {
      const allMenuItem = await this.menuService.findAll(restaurantId);
      return res.status(HttpStatus.OK).json(allMenuItem);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':restaurantId/menuItem/:id')
  async findByIdItems(
    @Res() res,
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    try {
      const allMenuItem = await this.menuService.findById(restaurantId, id);
      return res.status(HttpStatus.OK).json(allMenuItem);
    } catch (err) {
      if (err.status) {
        throw new HttpException(err.response, err.status);
      }

      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
