import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category } from './schemas/category.schema';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(name: string, restaurant: Restaurant): Promise<Category> {
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
