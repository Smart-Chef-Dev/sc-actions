import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './schemas/users.schema';
import { ConfigService } from '@nestjs/config';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';

@Injectable()
export class UsersService {
  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
