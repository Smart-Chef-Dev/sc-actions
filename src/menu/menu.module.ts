import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { Course, CourseSchema } from './schemas/course.shema';
import {
  Restaurant,
  RestaurantSchema,
} from '../restaurant/schemas/restaurant.schema';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__filename, '../photos'),
    }),
    RestaurantModule,
    TelegramModule,
    ConfigModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
