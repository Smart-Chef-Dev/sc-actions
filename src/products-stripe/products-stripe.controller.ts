import { Controller, Get } from '@nestjs/common';

import { ProductsStripeService } from './products-stripe.service';

@Controller('products-stripe')
export class ProductsStripeController {
  constructor(private readonly productsStripeService: ProductsStripeService) {}

  @Get()
  findAll() {
    return this.productsStripeService.findAll();
  }
}
