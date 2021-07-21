import { Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ProductsStripeService } from './products-stripe.service';
import { UsersService } from '../users/users.service';

@Controller('products-stripe')
export class ProductsStripeController {
  constructor(
    private readonly productsStripeService: ProductsStripeService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll() {
    return this.productsStripeService.findAll();
  }

  @Get('price')
  findAllPrice() {
    return this.productsStripeService.findAllPrice();
  }

  @Post('price/:pricesId/create-checkout-session')
  async createCheckoutSession(
    @Param('pricesId') pricesId: string,
    @Headers('authorization') authorization,
  ) {
    const jwt = authorization.split(' ')[1];
    const payload = await this.jwtService.decode(jwt);

    const session = await this.usersService.createCheckoutSession(
      pricesId,
      payload['email'],
    );

    return session.url;
  }
}
