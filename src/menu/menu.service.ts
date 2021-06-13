import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose } from 'mongoose';

import { Course } from './schemas/course.shema';
import { Category } from '../category/schemas/category.schema';

import { TelegramService } from '../telegram/telegram.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { MenuItemsDto } from './dto/menuItems';
import { MenuBusinessErrors } from '../shared/errors/menu/menu.business-errors';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private readonly telegramService: TelegramService,
    private readonly restaurantService: RestaurantService,
    private readonly mongoose: Mongoose,
  ) {}

  async create(dto: MenuItemsDto) {
    const idValidation = await this.mongoose.isValidObjectId(dto.categoryId);
    if (!idValidation) {
      throw new BadRequestException(MenuBusinessErrors.BadRequest);
    }

    const category = await this.categoryModel.findById(dto.categoryId);

    if (category) {
      const newMenuItem = new this.courseModel({
        name: dto.name,
        picture: dto.pictureUrl,
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

  async findAll(restaurantId: string): Promise<Course[]> {
    const idValidation = await this.mongoose.isValidObjectId(restaurantId);
    if (!idValidation) {
      throw new BadRequestException(MenuBusinessErrors.BadRequest);
    }

    const menuItem = await this.courseModel.find();

    return menuItem.filter((c) =>
      c.category.restaurant._id.equals(restaurantId),
    );
  }
}
