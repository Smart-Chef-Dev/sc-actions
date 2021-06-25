import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category } from './schemas/category.schema';
import { RestaurantService } from '../restaurant/restaurant.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly restaurantService: RestaurantService,
  ) {}

  async create(name: string, restaurantId: string): Promise<Category> {
    const restaurant = await this.restaurantService.findById(restaurantId);

    const newCategory = new this.categoryModel({
      name: name,
      restaurant: restaurant,
    });

    await newCategory.save();
    return newCategory;
  }

  async findAll(restaurantId: string): Promise<Category[]> {
    return this.categoryModel.find({
      'restaurant._id': Types.ObjectId(restaurantId),
    });
  }

  async findById(id: string): Promise<Category> {
    return this.categoryModel.findById({ _id: id });
  }
}
