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
  Req,
  UseGuards,
  BadRequestException,
  UseFilters,
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
import { AddonDto } from './dto/addon.dto';
import { checkIfUserHasPermissionToChangeRestaurant } from '../utils/checkIfUserHasPermissionToChangeRestaurant';
import { Users } from '../users/schemas/users.schema';
import { JwtGuard } from '../guard/jwt.guard';
import { LanguageEnum } from './enums/language.enum';
import { ProductsStripeService } from '../products-stripe/products-stripe.service';
import { Role } from '../users/enums/role.enum';
import { ProductDto } from './dto/product.dto';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guard/roles.guard';
import { ScBusinessExceptionFilter } from '../exception/sc-business-exception.filter';

@UseFilters(new ScBusinessExceptionFilter())
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
    private readonly productsStripeService: ProductsStripeService,
  ) {}

  @Get()
  public async findAll() {
    const restaurants = await this.restaurantService.findAll();

    return restaurants.filter((r) => !r.isAccessDisabled);
  }

  @Get(':id')
  public async findById(@Param('id') id: string, @Res() res) {
    const restaurant = await this.restaurantService.findById(id);

    await this.restaurantService.checkIfRestaurantIsBlocked(id);

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Post()
  public async create(@Res() res, @Body() dto: RestaurantDto) {
    const restaurant = await this.restaurantService.create(dto);

    if (!LanguageEnum[dto.language]) {
      let languages = [];
      for (const key in LanguageEnum) {
        languages = [...languages, key];
      }
      const text = `The language you specified is not supported by the application. Available languages ${languages.join(
        ', ',
      )}`;

      throw new NotFoundException(text);
    }

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Get(':id/action')
  public async getRestaurantActions(@Param('id') id: string, @Res() res) {
    await this.restaurantService.checkIfRestaurantIsBlocked(id);

    const actions = await this.restaurantService.findAllActions(id);
    await this.analyticsService.create({
      type: AnalyticType.GET_ACTIONS,
      restaurantId: id,
    });

    return res.status(HttpStatus.OK).json(actions);
  }

  @UseGuards(JwtGuard)
  @Post(':id/action')
  public async addActionIntoRestaurant(
    @Param('id') id: string,
    @Body() body: ActionDto,
    @Res() res,
    @Req() req,
  ) {
    const user: Users = req.user;
    const restaurant = await this.restaurantService.addActionIntoRestaurant(
      id,
      body,
    );

    await checkIfUserHasPermissionToChangeRestaurant(user, restaurant._id);

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Get(':id/table')
  public async getRestaurantTables(@Param('id') id: string, @Res() res) {
    await this.restaurantService.checkIfRestaurantIsBlocked(id);

    const tables = await this.restaurantService.findAllTables(id);

    return res
      .status(HttpStatus.OK)
      .json(tables.map((t) => ({ ...t, restaurantId: id })));
  }

  @UseGuards(JwtGuard)
  @Post(':id/table')
  public async addTableIntoRestaurant(
    @Param('id') id: string,
    @Body() body: TableDto,
    @Res() res,
    @Req() req,
  ) {
    const user: Users = req.user;
    const restaurant = await this.restaurantService.addTableIntoRestaurant(
      id,
      body,
    );

    await checkIfUserHasPermissionToChangeRestaurant(user, restaurant._id);

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Get(':id/addon')
  public async getRestaurantAddons(@Param('id') id: string) {
    await checkIsObjectIdValid(id);
    await this.restaurantService.checkIfRestaurantIsBlocked(id);

    const isRestaurantExist = await this.restaurantService.findById(id);
    if (!isRestaurantExist) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.restaurantService.findAllAddons(id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/addon')
  public async addAddonIntoRestaurant(
    @Param('id') id: string,
    @Body() body: AddonDto,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(id);

    const restaurant = await this.restaurantService.findById(id);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    await checkIfUserHasPermissionToChangeRestaurant(user, restaurant._id);

    const isAddonExist =
      await this.restaurantService.checkAddonExistingInRestaurantByName(
        id,
        body.name,
      );
    if (isAddonExist) {
      throw new ForbiddenException(
        'An addon with the same name already exists',
      );
    }

    return this.restaurantService.addAddonIntoRestaurant(id, body);
  }

  @Get(':id/category')
  async findAllCategory(@Param('id') id: string) {
    await checkIsObjectIdValid(id);

    const isRestaurantExist = await this.restaurantService.findById(id);
    if (!isRestaurantExist) {
      throw new NotFoundException();
    }

    await this.restaurantService.checkIfRestaurantIsBlocked(id);

    return this.categoryService.findAll(id);
  }

  @UseGuards(JwtGuard)
  @Post(':restaurantId/table/:tableId/user/:name')
  async assignWaitersToTable(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Param('name') name: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(restaurantId);
    await checkIsObjectIdValid(tableId);

    const restaurant = await this.restaurantService.findById(restaurantId);
    if (!restaurant) {
      throw new NotFoundException('Restaurant with this id does not exist');
    }

    await checkIfUserHasPermissionToChangeRestaurant(user, restaurant._id);

    const table: Table = restaurant.tables.find((table) =>
      table._id.equals(tableId),
    );
    if (!table) {
      throw new NotFoundException('Table with such id does not exist');
    }

    const waiters = await this.usersService.findUserByUsernameInRestaurant(
      name,
      restaurantId,
    );
    if (!waiters) {
      throw new NotFoundException(
        'User with this name does not exist in restaurant',
      );
    }

    const isUserAlreadyAssignedToTable = table.userIds.find((userId) =>
      waiters._id.equals(userId),
    );
    if (isUserAlreadyAssignedToTable) {
      throw new ForbiddenException('The waiter is already at this table');
    }

    return this.restaurantService.assignWaitersToTable(
      restaurant,
      table,
      waiters,
    );
  }

  @UseGuards(JwtGuard)
  @Post(':id/category')
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(id);

    const restaurant = await this.restaurantService.findById(id);
    if (!restaurant) {
      throw new NotFoundException();
    }

    await checkIfUserHasPermissionToChangeRestaurant(user, restaurant._id);

    const categoryNameIsAlreadyTakenInRestaurant =
      await this.categoryService.findCategoriesByNameInRestaurant(
        dto.name,
        restaurant._id,
      );
    if (categoryNameIsAlreadyTakenInRestaurant) {
      throw new ForbiddenException('Name is already taken');
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

    await this.restaurantService.checkIfRestaurantIsBlocked(id);

    return this.menuService.findAll(id);
  }

  @UseGuards(JwtGuard)
  @Get(':id/user/verification-of-rights')
  async checkingUserAccessToTheRestaurant(@Param('id') id: string, @Req() req) {
    const user: Users = req.user;
    await checkIfUserHasPermissionToChangeRestaurant(user, id);

    return true;
  }

  @UseGuards(JwtGuard)
  @Post(':id/upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Req() req,
  ) {
    const user: Users = req.user;
    await checkIsObjectIdValid(id);

    const restaurant = await this.restaurantService.findById(id);
    if (!restaurant) {
      throw new NotFoundException();
    }

    await checkIfUserHasPermissionToChangeRestaurant(user, id);

    const typeFile = path.extname(file.originalname);
    const pathFile = `${this.configService.get<string>(
      'PATH_TO_RESTAURANT_PHOTOS',
    )}/${id}/${nanoid()}${typeFile}`;

    await this.imagesService.createDirectory(
      `${this.configService.get<string>('PATH_TO_RESTAURANT_PHOTOS')}/${id}`,
    );
    await this.imagesService.saveFile(pathFile, file.buffer);

    return pathFile;
  }

  @Roles(Role.SUPER_ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post(':id/product')
  async addProduct(@Param('id') id: string, @Body() dto: ProductDto) {
    await checkIsObjectIdValid(id);

    const restaurant = await this.restaurantService.findById(id);
    const productAlreadyExists = restaurant.products.find(
      (p) => p.id === dto.id,
    );
    if (productAlreadyExists) {
      throw new BadRequestException(
        'This product has already been added to the restaurant',
      );
    }

    const price = await this.productsStripeService.findByPriceId(dto.priceId);
    if (price.product !== dto.id) {
      throw new BadRequestException('The price is pegged to another product');
    }

    await this.restaurantService.updateById(id, {
      products: [...restaurant.products, dto],
    });
  }
}
