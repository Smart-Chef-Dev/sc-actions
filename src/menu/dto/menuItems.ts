import { ModifiersDto } from './modifiers';

export class MenuItemsDto {
  name: string;
  pictureUrl: string;
  price: string;
  weight: string;
  time: string;
  description: string;
  modifiers: ModifiersDto[];
}
