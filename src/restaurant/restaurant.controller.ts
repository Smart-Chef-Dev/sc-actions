import { Controller, Get, Post, Res, Body, HttpStatus } from '@nestjs/common';

import { RestaurantService } from './restaurant.service';
import { RestaurantDto } from './dto/restaurant.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  public async findAll(@Res() res) {
    const restaurants = this.restaurantService.findAll();

    return res.status(HttpStatus.OK).json(restaurants);
  }

  @Post()
  public async create(@Res() res, @Body() dto: RestaurantDto) {
    const restaurant = await this.restaurantService.create(dto);

    return res.status(HttpStatus.OK).json(restaurant);
  }
}
