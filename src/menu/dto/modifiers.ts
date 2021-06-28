import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ModifiersDto {
  @IsString()
  @IsNotEmpty()
  readonly name: number;

  @IsNumber()
  readonly price: string;
}
