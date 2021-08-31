import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddonsDto {
  @IsString()
  @IsNotEmpty()
  readonly name: number;

  @IsNumber()
  readonly price: string;
}
