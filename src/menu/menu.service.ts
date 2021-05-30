import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from './schemas/category.schema';
import { Course } from './schemas/course.shema';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Course.name) private courseModel: Model<Category>,
  ) {}

  async addCategory(categoryName) {
    const newCategory = new this.categoryModel({
      category: categoryName,
    });

    await newCategory.save();
  }

  async addCourses(courseDto, categoryName) {
    const category = await this.categoryModel.findOne({
      category: categoryName,
    });

    if (category) {
      const newCourse = new this.courseModel({
        name: courseDto.name,
        picture: courseDto.picture,
        price: courseDto.price,
        weight: courseDto.weight,
        time: courseDto.time,
        description: courseDto.description,
        category: category,
      });

      await newCourse.save();
      return;
    }

    throw Error('Category does not exist');
  }
}
