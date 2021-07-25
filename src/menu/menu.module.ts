import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryModule } from '../category/category.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

import { Category, CategorySchema } from '../category/schemas/category.schema';
import { MenuItems, MenuItemsSchema } from './schemas/menuItems.shema';
import { Addons, AddonsSchema } from './schemas/addons.shema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: MenuItemsSchema },
      { name: Addons.name, schema: AddonsSchema },
    ]),
    CategoryModule,
  ],
  providers: [MenuService],
  exports: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
