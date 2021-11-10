import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as lqip from 'lqip';

import { MenuItems } from './schemas/menuItems.shema';
import { Category } from '../category/schemas/category.schema';
import { MenuItemsDto } from './dto/menuItems';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MenuItems.name) private menuItemsModel: Model<MenuItems>,
  ) {}

  async create(dto: MenuItemsDto, category: Category): Promise<MenuItems> {
    const order = await this.menuItemsModel
      .find({ 'category.restaurant._id': category.restaurant._id })
      .countDocuments();

    const pictureLqipPreview = await lqip.base64(dto.pictureUrl);

    const newMenuItem = new this.menuItemsModel({
      ...dto,
      category: category,
      pictureLqipPreview: pictureLqipPreview,
      pictureUrl: `/${dto.pictureUrl}`,
      order: order,
    });

    await newMenuItem.save();
    return newMenuItem;
  }

  async findAll(restaurantId: string): Promise<MenuItems[]> {
    return this.menuItemsModel
      .find({
        'category.restaurant._id': Types.ObjectId(restaurantId),
      })
      .sort({ order: 0 });
  }

  async findById(id: string): Promise<MenuItems> {
    return this.menuItemsModel.findById({
      _id: id,
    });
  }

  async findByCategoryId(categoryId: string): Promise<MenuItems[]> {
    return this.menuItemsModel
      .find({
        'category._id': Types.ObjectId(categoryId),
      })
      .sort({ order: 0 });
  }

  async findByCategoryIdInLimit(
    categoryId: string,
    page: number,
    limit: number,
  ): Promise<{ items: MenuItems[]; page: number; totalPages: number }> {
    const items = await this.menuItemsModel
      .find({
        'category._id': Types.ObjectId(categoryId),
      })
      .skip(+page)
      .limit(+limit)
      .sort({ order: 0 });

    const totalPages = await this.menuItemsModel
      .find({
        'category._id': Types.ObjectId(categoryId),
      })
      .countDocuments();

    const currentPage =
      +page + +limit - totalPages > 0 ? totalPages : +page + +limit;

    return {
      items: items,
      page: currentPage,
      totalPages: totalPages,
    };
  }

  async removeMenuItem(menuItemId: string) {
    return this.menuItemsModel.deleteOne({ _id: menuItemId });
  }

  async updateById(id: string, changes): Promise<MenuItems> {
    return this.menuItemsModel.findOneAndUpdate({ _id: id }, changes, {
      new: true,
    });
  }
}
