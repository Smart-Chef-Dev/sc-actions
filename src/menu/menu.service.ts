import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Course } from './schemas/course.shema';
import { Category } from '../category/schemas/category.schema';

import { TelegramService } from '../telegram/telegram.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { MenuItemsDto } from './dto/menuItems';
import { OrderDto } from './dto/order';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    private readonly telegramService: TelegramService,
    private readonly restaurantService: RestaurantService,
    private readonly logger: Logger,
  ) {}

  async create(dto: MenuItemsDto) {
    const category = await this.categoryModel.findById({
      _id: dto.categoryId,
    });

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

    throw Error('Not found');
  }

  async findAll(restaurantId: string): Promise<Course[]> {
    const menuItem = await this.courseModel.find();

    return menuItem.filter((c) =>
      c.category.restaurant._id.equals(restaurantId),
    );
  }

  async sendMessage(
    orderDto: OrderDto[],
    restaurantId: string,
    tableId: string,
  ) {
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
