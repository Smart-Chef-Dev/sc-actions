import { Controller, Get, Param, Res } from '@nestjs/common';

import { MenuService } from '../menu/menu.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':id/menuItems')
  async findMenuItemsByIdCategory(@Res() res, @Param('id') id: string) {
    return this.menuService.findByIdCategory(id);
  }
}
