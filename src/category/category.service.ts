import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(dto: CreateCategoryDto, restaurant): Promise<Category> {
    const newCategory = new this.categoryModel({
      name: dto.name,
      restaurant: restaurant,
    });

    await newCategory.save();
    return newCategory;
  }

  async findAll(restaurantId: string): Promise<Category[]> {
    const category = await this.categoryModel.find();

    return category.filter((c) => c.restaurant._id.equals(restaurantId));
  }

  public async findById(id: string): Promise<Category> {
    return this.categoryModel.findById({ _id: id });
  }
}
