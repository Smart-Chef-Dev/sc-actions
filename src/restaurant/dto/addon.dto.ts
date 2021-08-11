import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddonDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsNumber()
  readonly price: number;

  @IsNumber()
  readonly weight: number;
}
