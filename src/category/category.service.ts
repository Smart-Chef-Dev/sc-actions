import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { RestaurantService } from '../restaurant/restaurant.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose } from 'mongoose';

import { Category } from './schemas/category.schema';
import { CategoryBusinessErrors } from '../shared/errors/category/catrgory.business-errors';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly restaurantService: RestaurantService,
    private readonly mongoose: Mongoose,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const idValidation = await this.mongoose.isValidObjectId(dto.restaurantId);
    if (!idValidation) {
      throw new BadRequestException(CategoryBusinessErrors.BadRequest);
    }

    const restaurant = await this.restaurantService.findById(dto.restaurantId);

    if (restaurant) {
      const newCategory = new this.categoryModel({
        category: dto.name,
        restaurant: restaurant,
      });

      await newCategory.save();
      return newCategory;
    }

    throw new NotFoundException(CategoryBusinessErrors.NotFoundCategory);
  }

  async findAll(restaurantId: string): Promise<Category[]> {
    const idValidation = await this.mongoose.isValidObjectId(restaurantId);
    if (!idValidation) {
      throw new BadRequestException(CategoryBusinessErrors.BadRequest);
    }

    const category = await this.categoryModel.find();

    return category.filter((c) => c.restaurant._id.equals(restaurantId));
  }

  public async findById(id: string): Promise<Category> {
    return this.categoryModel.findById({ _id: id });
  }
}
