import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as lqip from 'lqip';

import { MenuItems } from './schemas/menuItems.shema';
import { Category } from '../category/schemas/category.schema';
import { MenuItemsDto } from './dto/menuItems';
import { Addons } from './schemas/addons.shema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MenuItems.name) private menuItemsModel: Model<MenuItems>,
    @InjectModel(Addons.name) private addonsModel: Model<Addons>,
  ) {}

  async create(dto: MenuItemsDto, category: Category): Promise<MenuItems> {
    const pictureLqipPreview = await lqip.base64(dto.pictureUrl);

    const addons = await Promise.all(
      dto.addons?.map(
        (m) =>
          new this.addonsModel({
            name: m.name,
            price: m.price,
          }),
      ) ?? [],
    );

    const newMenuItem = new this.menuItemsModel({
      ...dto,
      category: category,
      pictureLqipPreview: pictureLqipPreview,
      pictureUrl: `/${dto.pictureUrl}`,
      addons: addons,
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

  async findByCategoryId(categoryId: string): Promise<MenuItems[]> {
    return this.menuItemsModel.find({
      'category._id': Types.ObjectId(categoryId),
    });
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
}
