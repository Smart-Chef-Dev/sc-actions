import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import * as lqip from 'lqip';

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
    const pictureLqipPreview = await lqip.base64(dto.pictureUrl);

    const newMenuItem = new this.menuItemsModel({
      ...dto,
      category: category,
      pictureLqipPreview: pictureLqipPreview,
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
      .count();

    const currentPage =
      +page + +limit - totalPages > 0 ? totalPages : +page + +limit;

    return {
      items: items,
      page: currentPage,
      totalPages: totalPages,
    };
  }

  async updateById(
    id: string,
    changes: UpdateQuery<MenuItems>,
  ): Promise<MenuItems> {
    return this.menuItemsModel.findOneAndUpdate({ _id: id }, changes, {
      new: true,
    });
  }
}
