import { MaxLength, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class TableDto {
  @IsNumber()
  readonly number: number;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  public constructor(init?: Partial<TableDto>) {
    Object.assign(this, init);
  }
}
