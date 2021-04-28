import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schemas/users.schema';
import { JwtService } from '@nestjs/jwt';
import { promises } from 'dns';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<Users> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const newUser = new this.usersModel({
      email: createUserDto.email,
      password: hash,
    });

    return newUser.save();
  }

  async singIn(createUserDto: CreateUserDto): Promise<string> {
    const user = await this.findByEmail(createUserDto.email);

    const isMatch = await bcrypt.compare(createUserDto.password, user.password);
    if (isMatch) {
      return this.jwtService.sign({ email: user.email });
    }

    throw Error('Not found');
  }

  async findByEmail(email): Promise<Users> {
    return this.usersModel.findOne({ email: email });
  }
}
