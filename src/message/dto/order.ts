export class OrderDto {
  personCount: string;
  order: [
    {
      name: string;
      count: string;
      productId: string;
      modifiers: [{ name: string; isIncludedInOrder: boolean }];
    },
  ];
}
