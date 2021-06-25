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
      @InjectModel(MenuItems.name) private menuItemsModel: Model<MenuItems>,
      private readonly categoryService: CategoryService,
  ) {}

  async create(dto: MenuItemsDto, categoryId: string): Promise<MenuItems> {
    const category = await this.categoryService.findById(categoryId);

    const newMenuItem = new this.menuItemsModel({
      ...dto,
      category: category,
    });

    await newMenuItem.save();
    return newMenuItem;
  }

  async findAll(restaurantId: string): Promise<MenuItems[]> {
    return this.menuItemsModel.find({
      'category.restaurant._id': Types.ObjectId(restaurantId),
    });
  }

  async findById(id: string): Promise<MenuItems> {
    return this.menuItemsModel.findById({
      _id: id,
    });
  }

  async findByIdCategory(categoryId: string): Promise<MenuItems[]> {
    return this.menuItemsModel.find({
      'category._id': Types.ObjectId(categoryId),
    });
  }
}
