import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose } from 'mongoose';

import { MenuItems } from './schemas/menuItems.shema';
import { Category } from '../category/schemas/category.schema';

import { MenuItemsDto } from './dto/menuItems';
import { MenuBusinessErrors } from '../shared/errors/menu/menu.business-errors';
import { CategoryService } from '../category/category.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MenuItems.name) private courseModel: Model<MenuItems>,
    private readonly categoryService: CategoryService,
    private readonly mongoose: Mongoose,
  ) {}

  async create(dto: MenuItemsDto) {
    const idValidation = await this.mongoose.isValidObjectId(dto.categoryId);
    if (!idValidation) {
      throw new BadRequestException(MenuBusinessErrors.BadRequest);
    }

    const category = await this.categoryService.findById(dto.categoryId);

    if (category) {
      const newMenuItem = new this.courseModel({
        name: dto.name,
        pictureUrl: `${process.env.FRONTEND_URL}/menuPhotos/${category.restaurant._id}/${dto.pictureId}.png`,
        price: dto.price,
        weight: dto.weight,
        time: dto.time,
        description: dto.description,
        category: category,
      });

      await newMenuItem.save();
      return newMenuItem;
    }

    throw new NotFoundException(MenuBusinessErrors.NotFoundCategory);
  }

  async findAll(restaurantId: string): Promise<MenuItems[]> {
    const idValidation = await this.mongoose.isValidObjectId(restaurantId);
    if (!idValidation) {
      throw new BadRequestException(MenuBusinessErrors.BadRequest);
    }

    const menuItem = await this.courseModel.find();

    return menuItem.filter((c) =>
      c.category.restaurant._id.equals(restaurantId),
    );
  }

  async findById(restaurantId: string, id: string): Promise<MenuItems> {
    const idValidation = await this.mongoose.isValidObjectId(restaurantId);
    if (!idValidation) {
      throw new BadRequestException(MenuBusinessErrors.BadRequest);
    }

    const menuItem = await this.courseModel.find();

    return menuItem.find((c) => c._id.equals(id));
  }
}
