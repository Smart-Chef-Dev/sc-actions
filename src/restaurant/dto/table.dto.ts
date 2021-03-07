import { MaxLength, IsNotEmpty, IsString } from 'class-validator';

export class TableDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  public constructor(init?: Partial<TableDto>) {
    Object.assign(this, init);
  }
}
