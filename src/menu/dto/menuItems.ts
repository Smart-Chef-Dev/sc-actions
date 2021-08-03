import { AddonsDto } from './addons';
import { IsNumber, IsString } from 'class-validator';

export class MenuItemsDto {
  @IsString()
  name: string;

  @IsString()
  pictureUrl: string;

  @IsNumber()
  price: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  time: number;

  @IsString()
  description: string;

  addons: AddonsDto[];
}
