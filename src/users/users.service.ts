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

  async signUp(createUserDto: CreateUserDto): Promise<Users> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const newUser = new this.usersModel({
      email: createUserDto.email,
      password: hash,
    });

    return await newUser.save();
  }

  async singIn(createUserDto: CreateUserDto) {
    const user = await this.findByEmail(createUserDto.email);

    const isMatch = await bcrypt.compare(createUserDto.password, user.password);
    if (isMatch) return this.jwtService.sign({ email: user.email });

    throw {
      message: 'Not found',
    };
  }

  async findByEmail(email): Promise<Users> {
    return this.usersModel.findOne({ email: email });
  }
}
