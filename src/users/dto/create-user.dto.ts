export class CreateUserDto {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }

  email: string;
  password: string;
}
