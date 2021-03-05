import { IsString } from 'class-validator';

export class CreateMessageDto {
  constructor({ restaurantId, tableId, actionId }) {
    this.restaurantId = restaurantId;
    this.actionId = actionId;
    this.tableId = tableId;
  }

  @IsString()
  readonly restaurantId: string;

  @IsString()
  readonly tableId: string;

  @IsString()
  readonly actionId: string;
}
