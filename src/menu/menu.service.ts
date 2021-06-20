import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MenuItems } from './schemas/menuItems.shema';
import { Category } from '../category/schemas/category.schema';

import { MenuItemsDto } from './dto/menuItems';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MenuItems.name) private courseModel: Model<MenuItems>,
  ) {}

  async create(dto: MenuItemsDto, category): Promise<MenuItems> {
    const newMenuItem = new this.courseModel({
      name: dto.name,
      pictureUrl: dto.pictureUrl,
      price: dto.price,
      weight: dto.weight,
      time: dto.time,
      description: dto.description,
      category: category,
    });

    await newMenuItem.save();
    return newMenuItem;
  }

  async findAll(restaurantId: string): Promise<MenuItems[]> {
    return this.courseModel.find({
      'category.restaurant._id': Types.ObjectId(restaurantId),
    });
  }

  async findById(id: string): Promise<MenuItems> {
    return this.courseModel.findById({
      _id: id,
    });
  }

  async findByIdCategory(categoryId: string): Promise<MenuItems[]> {
    return this.courseModel.find({
      'category._id': Types.ObjectId(categoryId),
    });
  }
}
