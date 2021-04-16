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

  @IsString()
  @MaxLength(300)
  readonly link: string;

  public constructor(init?: Partial<ActionDto>) {
    Object.assign(this, init);
  }
}
