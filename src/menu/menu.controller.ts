import { Controller, Get, Param } from '@nestjs/common';

import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':id')
  findByIdItems(@Param('id') id: string) {
    return this.menuService.findById(id);
  }
}
