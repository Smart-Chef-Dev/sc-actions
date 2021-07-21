import { MaxLength, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { TableDto } from './table.dto';
import { ActionDto } from './action.dto';

export class RestaurantDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly currencyCode: string;

  @IsArray()
  readonly usernames: string[];

  readonly tables: TableDto[];

  readonly actions: ActionDto[];

  public constructor(init?: Partial<RestaurantDto>) {
    Object.assign(this, init);
  }
}
