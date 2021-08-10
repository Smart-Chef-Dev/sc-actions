import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category } from './schemas/category.schema';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
  ) {}

  async create(name: string, restaurant: Restaurant): Promise<Category> {
    const n = await this.categoryModel
      .find({ 'restaurant._id': restaurant._id })
      .countDocuments();

    const newCategory = new this.categoryModel({
      name: name,
      restaurant: restaurant,
      n,
    });

    await newCategory.save();
    return newCategory;
  }

  async findAll(restaurantId: string): Promise<Category[]> {
    return this.categoryModel
      .find({
        'restaurant._id': Types.ObjectId(restaurantId),
      })
      .sort({ n: 0 });
  }

  async findById(id: string): Promise<Category> {
    return this.categoryModel.findById({ _id: id });
  }

  async findCategoriesByNameInRestaurant(
    name: string,
    restaurantId: string,
  ): Promise<Category> {
    return this.categoryModel.findOne({
      name,
      'restaurant._id': Types.ObjectId(restaurantId),
    });
  }

  async removeCategory(categoryId) {
    return this.categoryModel.deleteOne({ _id: categoryId });
  }

  async updateById(id: string, changes): Promise<Category> {
    return this.categoryModel.findOneAndUpdate({ _id: id }, changes, {
      new: true,
    });
  }

  async swapCategories(category1, category2) {
    await this.categoryModel.updateOne(
      { _id: category1._id },
      { n: category2.n },
    );
    await this.categoryModel.updateOne(
      { _id: category2._id },
      { n: category1.n },
    );
  }
}
