import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { ProductsStripeService } from './products-stripe.service';
import { UsersService } from '../users/users.service';
import { Users } from '../users/schemas/users.schema';
import { JwtGuard } from '../guard/jwt.guard';

@Controller('products-stripe')
export class ProductsStripeController {
  constructor(
    private readonly productsStripeService: ProductsStripeService,
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

  @UseGuards(JwtGuard)
  @Post('price/:priceId/create-checkout-session')
  async createCheckoutSession(@Param('priceId') priceId: string, @Req() req) {
    const user: Users = req.user;

    const session = await this.usersService.createCheckoutSession(
      priceId,
      user.email,
    );

    return session.url;
  }
}
