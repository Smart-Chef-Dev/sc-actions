import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryModule } from 'src/category/category.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

import { Category, CategorySchema } from 'src/category/schemas/category.schema';
import { MenuItems, MenuItemsSchema } from './schemas/menuItems.shema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: MenuItems.name, schema: MenuItemsSchema },
    ]),
    CategoryModule,
  ],
  providers: [MenuService],
  exports: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
