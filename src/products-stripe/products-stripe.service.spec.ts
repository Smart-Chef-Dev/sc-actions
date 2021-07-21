import { Test, TestingModule } from '@nestjs/testing';
import { ProductsStripeService } from './products-stripe.service';

describe('ProductsStripeService', () => {
  let service: ProductsStripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsStripeService],
    }).compile();

    service = module.get<ProductsStripeService>(ProductsStripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
