import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from './schemas/category.schema';
import { Course } from './schemas/course.shema';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';
import { OrderDto } from './dto/order';
import { RestaurantService } from '../restaurant/restaurant.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Course.name) private courseModel: Model<Category>,
    @InjectModel(Restaurant.name) private restaurantModel: Model<Category>,
    private readonly restaurantService: RestaurantService,
    private readonly telegramService: TelegramService,
  ) {}

  async addCategory(categoryName, restaurantId) {
    const restaurant = await this.restaurantModel.findById({
      _id: restaurantId,
    });

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

  async addCourse(courseDto, categoryName, restaurantId) {
    const category = await this.categoryModel.findOne({
      category: categoryName,
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

  async getCategory(restaurantId) {
    return this.categoryModel.find({
      restaurant: restaurantId,
    });
  }

  async getCourse(restaurantId) {
    return this.courseModel.find({
      restaurant: restaurantId,
    });
  }

  async sendMessage(orderDto, restaurantId, tableId) {
    const restaurant = await this.restaurantService.findById(restaurantId);
    const table = restaurant.tables.find((t) => t._id.equals(tableId));

    let text = `${table.name} - `;
    for (let i = 0; i < orderDto.length; i++) {
      text = text + `${orderDto[i].name}(${orderDto[i].count}),`;
    }

    for (const username of restaurant.usernames) {
      await this.telegramService.sendMessage(username, text);
    }
  }
}
