import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './schemas/users.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: CreateUserDto): Promise<Users> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);

    const newUser = new this.usersModel({
      email: dto.email,
      password: hash,
    });

    return newUser.save();
  }

  async singIn(dto: CreateUserDto): Promise<string> {
    const user = await this.findByEmail(dto.email);

    return this.jwtService.sign({ email: user.email });
  }

  async findByEmail(email): Promise<Users> {
    return this.usersModel.findOne({ email: email });
  }
}
