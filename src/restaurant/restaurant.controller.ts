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
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';
import * as path from 'path';

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
import { objectIdValidation } from '../helper-functions/objectIdValidation';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesBusinessErrors } from '../shared/errors/images/images.business-errors';
import { ImagesService } from '../images/images.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService,
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService,
    private readonly categoryService: CategoryService,
    private readonly imagesService: ImagesService,
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
  async createCategory(@Body() dto: CreateCategoryDto) {
    await objectIdValidation(dto.restaurantId);

    const restaurant = await this.restaurantService.findById(dto.restaurantId);

    if (!restaurant) {
      throw new NotFoundException(CategoryBusinessErrors.NotFoundCategory);
    }

    return this.categoryService.create(dto.name, dto.restaurantId);
  }

  @Get(':restaurantId/category')
  async findAllCategory(@Param('restaurantId') restaurantId: string) {
    await objectIdValidation(restaurantId);

    return this.categoryService.findAll(restaurantId);
  }

  @Post('/menu-item')
  async createMenuItem(@Body() dto: MenuItemsDto) {
    await objectIdValidation(dto.categoryId);

    const category = await this.categoryService.findById(dto.categoryId);

    if (!category) {
      throw new NotFoundException(MenuBusinessErrors.NotFoundCategory);
    }

    return this.menuService.create(dto);
  }

  @Get(':restaurantId/menu-items')
  async findAllMenuItems(@Param('restaurantId') restaurantId: string) {
    await objectIdValidation(restaurantId);

    return this.menuService.findAll(restaurantId);
  }

  @Post(':restaurantId/upload-photos')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('restaurantId') restaurantId: string,
  ) {
    await objectIdValidation(restaurantId);

    const doesRestaurantExist = await this.restaurantService.findById(
      restaurantId,
    );

    if (!doesRestaurantExist) {
      throw new BadRequestException(ImagesBusinessErrors.NotFoundRestaurant);
    }

    const typeFile = path.extname(file.originalname);
    const pathFile = `${this.configService.get<string>(
      'PATH_PHOTOS_MENU',
    )}/${restaurantId}/${nanoid()}${typeFile}`;

    await this.imagesService.createDirectory(
      `${this.configService.get<string>('PATH_PHOTOS_MENU')}/${restaurantId}`,
    );
    await this.imagesService.saveFile(pathFile, file.buffer);

    return `${this.configService.get<string>('FRONTEND_URL')}/${pathFile}`;
  }
}
