import { MaxLength, IsNotEmpty, IsString } from 'class-validator';

export class ActionDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MaxLength(300)
  @IsNotEmpty()
  readonly message: string;
}
