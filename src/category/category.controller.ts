import { Controller, Get, Param } from '@nestjs/common';

import { MenuService } from '../menu/menu.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':id/menuItems')
  findMenuItemsByIdCategory(@Param('id') id: string) {
    return this.menuService.findByIdCategory(id);
  }
}
