import { Addon } from '../../restaurant/schemas/addon.shema';

export class MenuItemsDto {
  name: string;
  pictureUrl: string;
  price: number;
  weight: number;
  time: number;
  description: string;
  categoryId: string;
  addons: Addon[];
}
