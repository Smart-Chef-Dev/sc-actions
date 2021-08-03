import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddonsDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly price: number;
}
