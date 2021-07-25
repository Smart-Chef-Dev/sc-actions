export class CreateUserDto {
  email: string;

  password: string;

  constructor(init?: Partial<CreateUserDto>) {
    Object.assign(this, init);
  }
}
