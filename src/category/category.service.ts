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

  async findAllCategoriesInLimit(
    restaurantId: string,
    page: number,
    limit: number,
  ): Promise<{ categories: Category[]; page: number; totalPages: number }> {
    const categories = await this.categoryModel
      .find({
        'restaurant._id': Types.ObjectId(restaurantId),
      })
      .skip(+page)
      .limit(+limit);

    const totalPages = await this.categoryModel
      .find({
        'restaurant._id': Types.ObjectId(restaurantId),
      })
      .estimatedDocumentCount();

    const currentPage =
      +page + +limit - totalPages > 0 ? totalPages : +page + +limit;

    return {
      categories: categories,
      page: currentPage,
      totalPages: totalPages,
    };
  }

  async findById(id: string): Promise<Category> {
    return this.categoryModel.findById({ _id: id });
  }
}
