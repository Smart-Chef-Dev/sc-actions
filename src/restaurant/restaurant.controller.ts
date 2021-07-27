import {
  Controller,
  Get,
  Post,
  Res,
  Param,
  Body,
  HttpStatus,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import * as path from 'path';

import { CreateCategoryDto } from 'src/category/dto/create-category.dto';
import { RestaurantService } from './restaurant.service';
import { RestaurantDto } from './dto/restaurant.dto';
import { ActionDto } from './dto/action.dto';
import { TableDto } from './dto/table.dto';

import { AnalyticsService } from 'src/analytics/analytics.service';
import { CategoryService } from 'src/category/category.service';
import { ImagesService } from 'src/images/images.service';
import { MenuService } from 'src/menu/menu.service';

import { AnalyticType } from '../analytics/enums/analytic-type.enum';
import { checkIsObjectIdValid } from '../utils/checkIsObjectIdValid';
import { UsersService } from '../users/users.service';
import { Table } from './schemas/table.schema';

@Controller('restaurant')
export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService,
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService,
    private readonly categoryService: CategoryService,
    private readonly imagesService: ImagesService,
    private readonly menuService: MenuService,
    private readonly usersService: UsersService,
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

  @Get(':id/category')
  async findAllCategory(@Param('id') id: string) {
    await checkIsObjectIdValid(id);

    const isRestaurantExist = await this.restaurantService.findById(id);
    if (!isRestaurantExist) {
      throw new NotFoundException();
    }

    return this.categoryService.findAll(id);
  }

  @Post(':restaurantId/table/:tableId/user/:name')
  async assignUserToTable(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Param('name') name: string,
  ) {
    await checkIsObjectIdValid(restaurantId);
    await checkIsObjectIdValid(tableId);

    const restaurant = await this.restaurantService.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant with this id does not exist');
    }

    const table: Table = restaurant.tables.find((table) =>
      table._id.equals(tableId),
    );
    if (!table) {
      throw new NotFoundException('Table with such id does not exist');
    }

    const user = await this.usersService.findUserByUsernameInRestaurant(
      name,
      restaurantId,
    );
    if (!user) {
      throw new NotFoundException(
        'User with this name does not exist in restaurant',
      );
    }

    const isUserAlreadyAssignedToTable = table.userIds.find((userId) =>
      user._id.equals(userId),
    );
    if (isUserAlreadyAssignedToTable) {
      throw new ForbiddenException('The waiter is already at this table');
    }

    return this.restaurantService.assignUserToTable(restaurant, table, user);
  }

  @Post(':id/category')
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Param('id') id: string,
  ) {
    await checkIsObjectIdValid(id);

    const restaurant = await this.restaurantService.findById(id);
    if (!restaurant) {
      throw new NotFoundException();
    }

    return this.categoryService.create(dto.name, restaurant);
  }

  @Get(':id/menu-items')
  async findAllMenuItems(@Param('id') id: string) {
    await checkIsObjectIdValid(id);

    const isRestaurantExist = await this.restaurantService.findById(id);
    if (!isRestaurantExist) {
      throw new NotFoundException();
    }

    return this.menuService.findAll(id);
  }

  @Post(':id/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    await checkIsObjectIdValid(id);

    const isRestaurantExist = await this.restaurantService.findById(id);
    if (!isRestaurantExist) {
      throw new NotFoundException();
    }

    const typeFile = path.extname(file.originalname);
    const pathFile = `${this.configService.get<string>(
      'PATH_TO_RESTAURANT_PHOTOS',
    )}/${id}/${nanoid()}${typeFile}`;

    await this.imagesService.createDirectory(
      `${this.configService.get<string>('PATH_TO_RESTAURANT_PHOTOS')}/${id}`,
    );
    await this.imagesService.saveFile(pathFile, file.buffer);

    return `${this.configService.get<string>('BACKEND_URL')}/${pathFile}`;
  }
}
