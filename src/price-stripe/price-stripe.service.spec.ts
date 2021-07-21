import { Test, TestingModule } from '@nestjs/testing';
import { PriceStripeService } from './price-stripe.service';

describe('PriceStripeService', () => {
  let service: PriceStripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceStripeService],
    }).compile();

    service = module.get<PriceStripeService>(PriceStripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
