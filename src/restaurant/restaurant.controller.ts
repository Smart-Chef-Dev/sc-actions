import {
  Controller,
  Get,
  Post,
  Res,
  Param,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RestaurantService } from './restaurant.service';
import { RestaurantDto } from './dto/restaurant.dto';
import { ActionDto } from './dto/action.dto';
import { TableDto } from './dto/table.dto';
import { QrCodeService } from '../qr-code/qr-code.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService,
    private readonly configService: ConfigService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  @Get()
  public async findAll(@Res() res) {
    const restaurants = await this.restaurantService.findAll();

    return res.status(HttpStatus.OK).json(restaurants);
  }

  @Post()
  public async create(@Res() res, @Body() dto: RestaurantDto) {
    const restaurant = await this.restaurantService.create(dto);

    return res.status(HttpStatus.OK).json(restaurant);
  }

  @Get(':id/action')
  public async getRestaurantActions(@Param('id') id: string, @Res() res) {
    const actions = await this.restaurantService.findAllActions(id);

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

  private getQrCodeUrl(restaurantId: string, tableId: string) {
    const url = this.configService.get('frontendUrl');

    return `${url}/${restaurantId}/${tableId}`;
  }

  @Get(':id/table/:tableId/svg')
  public async getRestaurantTableSvg(
    @Param('id') id: string,
    @Param('tableId') tableId: string,
    @Res() res,
  ) {
    if (
      !(await this.restaurantService.checkTableExistingInRestaurant(
        id,
        tableId,
      ))
    ) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    const contentUrl = this.getQrCodeUrl(id, tableId);
    res.set('Content-Type', 'image/svg+xml');
    res.set('Content-Disposition', `attachment; filename=${tableId}.svg`);
    const qrCode = await this.qrCodeService.generateSvg(contentUrl);

    return res.status(HttpStatus.OK).send(qrCode);
  }

  @Get(':id/table/:tableId/png')
  public async getRestaurantTablePng(
    @Param('id') id: string,
    @Param('tableId') tableId: string,
    @Res() res,
  ) {
    if (
      !(await this.restaurantService.checkTableExistingInRestaurant(
        id,
        tableId,
      ))
    ) {
      return res.status(HttpStatus.NOT_FOUND).send();
    }

    const contentUrl = this.getQrCodeUrl(id, tableId);
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename=${tableId}.png`);
    const qrCode = await this.qrCodeService.generatePng(contentUrl);

    return res.status(HttpStatus.OK).send(qrCode);
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
}
