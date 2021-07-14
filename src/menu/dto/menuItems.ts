import { AddonsDto } from './addons';

export class MenuItemsDto {
  name: string;
  pictureUrl: string;
  price: string;
  weight: string;
  time: string;
  description: string;
  addons: AddonsDto[];
}
