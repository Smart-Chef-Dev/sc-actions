import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RestaurantService } from '../restaurant/restaurant.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly restaurantService: RestaurantService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const restaurant = await this.restaurantService.findById(
      createCategoryDto.restaurantId,
    );

    if (restaurant) {
      const newCategory = new this.categoryModel({
        category: createCategoryDto.name,
        restaurant: restaurant,
      });

      await newCategory.save();
      return newCategory;
    }

    throw Error('Not found');
  }

  async findAll(restaurantId: string): Promise<Category[]> {
    const category = await this.categoryModel.find();

    return category.filter((c) => c.restaurant._id.equals(restaurantId));
  }
}
