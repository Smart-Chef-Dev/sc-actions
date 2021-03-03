import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Restaurant } from './schemas/restaurant.schema';
import { RestaurantDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
  ) {}

  public async findAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find().exec();
  }

  public async create(dto: RestaurantDto): Promise<Restaurant> {
    const restaurant = await new this.restaurantModel(dto);

    return restaurant.save();
  }
}
