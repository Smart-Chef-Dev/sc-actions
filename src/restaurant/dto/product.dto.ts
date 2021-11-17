import { IsNotEmpty, IsString } from 'class-validator';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  readonly productId: string;

  @IsString()
  @IsNotEmpty()
  readonly priceId: string;

  public constructor(init?: Partial<ProductDto>) {
    Object.assign(this, init);
  }
}
