import { MaxLength, IsNotEmpty, IsString } from 'class-validator';

export class TableDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly code: string;
}
