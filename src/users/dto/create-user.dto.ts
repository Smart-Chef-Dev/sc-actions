export class CreateUserDto {
  email: string;

  password: string;

  name: string;

  constructor(init?: Partial<CreateUserDto>) {
    Object.assign(this, init);
  }
}
