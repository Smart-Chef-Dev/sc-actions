import { Logger, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';

import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { TelegramModule } from '../telegram/telegram.module';

import { Course, CourseSchema } from './schemas/course.shema';
import { Category, CategorySchema } from '../category/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__filename, '../photos'),
    }),
    TelegramModule,
    RestaurantModule,
  ],
  controllers: [MenuController],
  providers: [MenuService, Logger],
})
export class MenuModule {}
