import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(30)
  @IsNotEmpty()
  name: string;

  public constructor(init?: Partial<CreateCategoryDto>) {
    Object.assign(this, init);
  }
}
