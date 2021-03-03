import { MaxLength, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { TableDto } from './table.dto';

export class RestaurantDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  @IsArray()
  readonly usernames: string[];

  readonly tables: TableDto[];
}
