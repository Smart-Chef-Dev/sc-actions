import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import reduce from 'awaity/reduce';

import { ProductsStripeService } from './products-stripe.service';
import { UsersService } from '../users/users.service';
import { Users } from '../users/schemas/users.schema';
import { JwtGuard } from '../guard/jwt.guard';
import { Role } from 'src/users/enums/role.enum';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Restaurant } from '../restaurant/schemas/restaurant.schema';
import { Action } from '../restaurant/schemas/action.schema';
import { Table } from '../restaurant/schemas/table.schema';
import { Addon } from '../restaurant/schemas/addon.shema';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';

@Controller('products-stripe')
export class ProductsStripeController {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<Restaurant>,
    @InjectModel(Action.name)
    private readonly actionModel: Model<Action>,
    @InjectModel(Table.name)
    private readonly tableModel: Model<Table>,
    @InjectModel(Users.name) private usersModel: Model<Users>,
    @InjectModel(Addon.name) private addonModel: Model<Addon>,
    private readonly productsStripeService: ProductsStripeService,
    private readonly usersService: UsersService,
    private restaurantService: RestaurantService,
  ) {}

  @Roles(Role.RESTAURANT_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  async getRestaurantProducts(@Req() req) {
    const user: Users = req.user;
    const restaurant = await this.restaurantService.findById(user.restaurantId);
    if (!restaurant) {
      throw new BadRequestException(
        'Your account is not linked to a restaurant',
      );
    }

    return reduce(
      restaurant.products,
      async (previousValue, currentValue) => {
        const product = await this.productsStripeService.findById(
          currentValue.id,
        );
        const price = await this.productsStripeService.findByPriceId(
          currentValue.priceId,
        );

        return [...previousValue, { ...product, price }];
      },
      [],
    );
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
