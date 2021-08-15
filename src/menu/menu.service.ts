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

  async create(
    dto: MenuItemsDto,
    category: Category,
    imgPath: string,
  ): Promise<MenuItems> {
    const n = await this.menuItemsModel
      .find({ 'category.restaurant._id': category.restaurant._id })
      .countDocuments();

    const pictureLqipPreview = await lqip.base64(imgPath.substring(1));

    const newMenuItem = new this.menuItemsModel({
      ...dto,
      category: category,
      pictureLqipPreview: pictureLqipPreview,
      n: n,
    });

    await newMenuItem.save();
    return newMenuItem;
  }

  async findAll(restaurantId: string): Promise<MenuItems[]> {
    return this.menuItemsModel
      .find({
        'category.restaurant._id': Types.ObjectId(restaurantId),
      })
      .sort({ n: 0 });
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
      .sort({ n: 0 });
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
      .limit(+limit);

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

  async swapMenuItems(menuItem1, menuItem2) {
    await this.menuItemsModel.updateOne(
      { _id: menuItem1._id },
      { n: menuItem2.n },
    );
    await this.menuItemsModel.updateOne(
      { _id: menuItem2._id },
      { n: menuItem1.n },
    );
  }

  async removeMenuItem(menuItemId: string) {
    return this.menuItemsModel.deleteOne({ _id: menuItemId });
  }

  async findMenuItemByNameInRestaurant(
    restaurantId: string,
    name: string,
  ): Promise<MenuItems> {
    return this.menuItemsModel.findOne({
      'category.restaurant._id': Types.ObjectId(restaurantId),
      name: name,
    });
  }

  async updateById(id: string, changes): Promise<MenuItems> {
    return this.menuItemsModel.findOneAndUpdate({ _id: id }, changes, {
      new: true,
    });
  }
}
