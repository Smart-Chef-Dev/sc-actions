import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from './schemas/category.schema';
import { Course } from './schemas/course.shema';

import { TelegramService } from '../telegram/telegram.service';
import { RestaurantService } from '../restaurant/restaurant.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private readonly telegramService: TelegramService,
    private readonly restaurantService: RestaurantService,
    private readonly logger: Logger,
  ) {}

  async addCategory(categoryName, restaurantId) {
    const restaurant = await this.restaurantService.findById(restaurantId);

    if (restaurant) {
      const newCategory = new this.categoryModel({
        category: categoryName,
        restaurant: restaurant,
      });

      await newCategory.save();
      return;
    }

    throw Error('Not found');
  }

  async addCourse(courseDto, restaurantId) {
    const category = await this.categoryModel.findOne({
      category: courseDto.categoryName,
    });

    if (category && category.restaurant == restaurantId) {
      const newCourse = new this.courseModel({
        name: courseDto.name,
        picture: courseDto.picture,
        price: courseDto.price,
        weight: courseDto.weight,
        time: courseDto.time,
        description: courseDto.description,
        category: category,
        restaurant: restaurantId,
      });

      await newCourse.save();
      return;
    }

    throw Error('Not found');
  }

  async getCategory(restaurantId): Promise<Category[]> {
    return this.categoryModel.find({
      restaurant: restaurantId,
    });
  }

  async getCourse(restaurantId): Promise<Course[]> {
    return this.courseModel.find({
      restaurant: restaurantId,
    });
  }

  async sendMessage(orderDto, restaurantId, tableId) {
    const restaurant = await this.restaurantService.findById(restaurantId);
    const table = restaurant.tables.find((t) => t._id.equals(tableId));

    let text = `person: ${orderDto[0].person}, ${table.name} -`;
    for (let i = 1; i < orderDto.length; i++) {
      text = text + ` ${orderDto[i].name}(${orderDto[i].count}),`;
    }

    for (const username of restaurant.usernames) {
      try {
        await this.telegramService.sendMessage(username, text);
      } catch (err) {
        if (err.error_code === 403) {
          this.logger.warn(
            `Failed to send a message to the user(${username}) from the restaurant(${restaurantId}). By reason ${err.description}`,
          );
        }
      }
    }
  }
}
