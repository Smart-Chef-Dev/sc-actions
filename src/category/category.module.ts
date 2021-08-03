import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryService } from './category.service';
import { ImagesService } from '../images/images.service';
import { MenuService } from '../menu/menu.service';
import { CategoryController } from './category.controller';

import { Category, CategorySchema } from './schemas/category.schema';
import { MenuItems, MenuItemsSchema } from '../menu/schemas/menuItems.shema';
import { Addons, AddonsSchema } from '../menu/schemas/addons.shema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: MenuItemsSchema },
      { name: Addons.name, schema: AddonsSchema },
    ]),
  ],
  providers: [CategoryService, MenuService, ImagesService],
  exports: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
