import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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

  findAll(restaurantId: string) {
    return this.categoryModel.findOne({
      'restaurant._id': Types.ObjectId(restaurantId),
    });
  }

  public async findById(id: string): Promise<Category> {
    return this.categoryModel.findById({ _id: id });
  }
}
