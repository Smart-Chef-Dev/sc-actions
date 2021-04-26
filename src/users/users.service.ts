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

  async signUp(createUserDto: CreateUserDto) {
    const checkForAbsence = await this.usersModel.findOne({ email: createUserDto.email });
    if (!checkForAbsence) {
      const password = createUserDto.password;
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const newUser = new this.usersModel();
      newUser.password = hash;
      newUser.email = createUserDto.email;

      await newUser.save();
      throw new HttpException('Account created', HttpStatus.OK);
    } else {
      throw new HttpException('Email is busy', HttpStatus.PRECONDITION_FAILED);
    }
  }

  async singIn(createUserDto: CreateUserDto) {
    const user = await this.usersModel.findOne({ email: createUserDto.email });
    const isMatch = await bcrypt.compare(createUserDto.password, user.password);

    if (isMatch) {
      return this.jwtService.sign({ id: user._id });
    }
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }
}
