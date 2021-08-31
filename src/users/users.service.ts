import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, UpdateQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';

import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './schemas/users.schema';
import { ConfigService } from '@nestjs/config';
import { InjectStripe } from 'nestjs-stripe';
import { Role } from './enums/role.enum';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async creatAccount(
    dto: {
      telegramId?: string;
      name?: string;
      password?: string;
      email?: string;
      restaurantId?: string;
    },
    role: string,
  ): Promise<Users> {
    let newUser;

    switch (role) {
      case Role.RESTAURANT_ADMIN:
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(dto.password, salt);

        newUser = await new this.usersModel({
          email: dto.email,
          password: hash,
          restaurantId: dto.restaurantId,
          role: Role.RESTAURANT_ADMIN,
        });

        break;
      case Role.WAITER:
        newUser = await new this.usersModel({
          name: dto.name,
          telegramId: dto.telegramId,
          restaurantId: dto.restaurantId,
          role: Role.WAITER,
        });

        break;
    }

    return newUser.save();
  }

  async singIn(dto: CreateUserDto): Promise<string> {
    const user = await this.findByEmail(dto.email);

    return this.jwtService.sign({ email: user.email });
  }

  async findByEmail(email): Promise<Users> {
    return this.usersModel.findOne({ email: email });
  }

  async findById(id): Promise<Users> {
    return this.usersModel.findById(id);
  }

  async checkIfRestaurantIsTiedToRestaurantAdmin(
    restaurantId: string,
  ): Promise<boolean> {
    return !!(await this.usersModel.findOne({
      restaurantId: restaurantId,
      role: Role.RESTAURANT_ADMIN,
    }));
  }

  async findUserByUsernameInRestaurant(
    name: string,
    restaurantId: string,
  ): Promise<Users> {
    return this.usersModel.findOne({
      name: name,
      restaurantId: restaurantId,
    });
  }

  async updateById(
    id: string,
    changes: { [key in string | number]: any },
  ): Promise<Users> {
    return this.usersModel.findOneAndUpdate(
      { _id: id },
      { $set: changes },
      {
        new: true,
      },
    );
  }

  getSubscriptionById(id) {
    return this.stripeClient.subscriptions.retrieve(id);
  }

  deleteSubscriptions(id) {
    return this.stripeClient.subscriptions.del(id);
  }

  async createCheckoutSession(priceId, email) {
    const frontendUrlSubscription = `${this.configService.get<string>(
      'FRONTEND_URL',
    )}/back-office/dashboard/?purchase=`;

    return this.stripeClient.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrlSubscription}success`,
      cancel_url: `${frontendUrlSubscription}canceled`,
    });
  }
}
