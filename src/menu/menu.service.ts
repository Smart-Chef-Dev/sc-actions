import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MenuItems } from './schemas/menuItems.shema';
import { Category } from '../category/schemas/category.schema';

import { MenuItemsDto } from './dto/menuItems';
import { CategoryService } from '../category/category.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MenuItems.name) private courseModel: Model<MenuItems>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(dto: MenuItemsDto): Promise<MenuItems> {
    const category = await this.categoryService.findById(dto.categoryId);

    const newMenuItem = new this.courseModel({
      ...dto,
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