import { MaxLength, IsNotEmpty, IsString } from 'class-validator';
import { TableDto } from './table.dto';
import { ActionDto } from './action.dto';
import { AddonDto } from './addon.dto';

export class RestaurantDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  @IsNotEmpty()
  readonly currencyCode: string;

  readonly tables: TableDto[];

  readonly actions: ActionDto[];

  readonly addons: AddonDto[];

  public constructor(init?: Partial<RestaurantDto>) {
    Object.assign(this, init);
  }
}
