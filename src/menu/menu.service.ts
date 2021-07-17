import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import * as lqip from 'lqip';

import { MenuItems } from './schemas/menuItems.shema';
import { Category } from '../category/schemas/category.schema';

import { MenuItemsDto } from './dto/menuItems';
import { CategoryService } from '../category/category.service';
import { Addons } from './schemas/addons.shema';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MenuItems.name) private menuItemsModel: Model<MenuItems>,
    @InjectModel(Addons.name) private addonsModel: Model<Addons>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(dto: MenuItemsDto, categoryId: string): Promise<MenuItems> {
    const category = await this.categoryService.findById(categoryId);

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
    const items = await this.menuItemsModel.find({
      'category._id': Types.ObjectId(categoryId),
    });

    return Promise.all(
      items.map(async (mi: MenuItems) => {
        if (!mi.pictureLqipPreview) {
          mi.pictureLqipPreview = await lqip.base64(mi.pictureUrl);
          await this.updateById(mi.id, {
            pictureLqipPreview: mi.pictureLqipPreview,
          });
        }

        return mi;
      }),
    );
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
