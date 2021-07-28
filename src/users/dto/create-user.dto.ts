export class CreateUserDto {
  email: string;

  password: string;

  restaurantId?: string;

  constructor(init?: Partial<CreateUserDto>) {
    Object.assign(this, init);
  }
}
