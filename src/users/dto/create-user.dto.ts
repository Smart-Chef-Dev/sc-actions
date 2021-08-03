import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  constructor(init?: Partial<CreateUserDto>) {
    Object.assign(this, init);
  }
}
