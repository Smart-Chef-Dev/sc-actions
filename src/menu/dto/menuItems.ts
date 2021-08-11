import { ActionDto } from '../../restaurant/dto/action.dto';
import { Addon } from '../../restaurant/schemas/addon.shema';

export class MenuItemsDto {
  name: string;
  pictureUrl: string;
  price: string;
  weight: string;
  time: string;
  description: string;
  categoryId: string;
  addons: Addon[];
}
