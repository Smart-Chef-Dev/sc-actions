export class OrderDto {
  personCount: string;
  order: [
    {
      name: string;
      count: string;
      productId: string;
      addons: [{ name: string; isIncludedInOrder: boolean }];
    },
  ];
}
