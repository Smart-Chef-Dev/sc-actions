import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UsersDocument } from './schemas/users.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<UsersDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async SignUp(createUserDto: CreateUserDto) {
    const password = createUserDto.password;
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);

    const newUser = new this.usersModel();
    newUser.password = hash;
    newUser.name = createUserDto.name;

    return newUser.save();
  }

  async SingIn(createUserDto: CreateUserDto) {
    const user = await this.usersModel.findOne({ name: createUserDto.name });
    const isMatch = await bcrypt.compare(createUserDto.password, user.password);

    if (isMatch) {
      return this.jwtService.sign({ id: user._id });
    }
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }
}
