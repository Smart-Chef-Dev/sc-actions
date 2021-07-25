import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';

import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './schemas/users.schema';
import { ConfigService } from '@nestjs/config';
import { InjectStripe } from 'nestjs-stripe';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly restaurantService: RestaurantService,
  ) {}

  async creatAccount(dto: {
    telegramId?: string;
    name?: string;
    password?: string;
    email?: string;
    restaurantId?: string;
  }): Promise<Users> {
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(dto.password, salt);

      return new this.usersModel({
        email: dto.email,
        password: hash,
      }).save();
    }

    return new this.usersModel({
      name: dto.name,
      telegramId: dto.telegramId,
      restaurantId: dto.restaurantId,
    }).save();
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

  async checkIfUsernameExistsInRestaurant(
    name: string,
    restaurantId: string,
  ): Promise<boolean> {
    return !!(await this.usersModel.findOne({
      name: name,
      restaurantId: restaurantId,
    }));
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

  async assignUserToTable(
    restaurantId: string,
    tableId: string,
    userId: string,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantService.findById(restaurantId);
    const changedRestaurant = restaurant.tables.map((table) =>
      table._id.equals(tableId)
        ? {
            ...table,
            userId: [...table.userId, userId],
          }
        : table,
    );

    return this.restaurantService.updateById(restaurantId, {
      $set: { tables: changedRestaurant },
    });
  }

  getSubscriptionById(id) {
    return this.stripeClient.subscriptions.retrieve(id);
  }

  deleteSubscriptions(id) {
    return this.stripeClient.subscriptions.del(id);
  }

  async createCheckoutSession(priceId, email) {
    const frontendUrlSubscription = '/back-office/dashboard';

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
      success_url: `${this.configService.get<string>(
        'FRONTEND_URL',
      )}${frontendUrlSubscription}/?purchase=success`,
      cancel_url: `${this.configService.get<string>(
        'FRONTEND_URL',
      )}${frontendUrlSubscription}/?purchase=canceled`,
    });
  }
}
