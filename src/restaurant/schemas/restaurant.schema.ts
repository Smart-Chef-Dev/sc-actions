import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Table } from './table.schema';
import { Action } from './action.schema';
import { Addon } from './addon.shema';

@Schema()
export class Restaurant extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  currencyCode: string;

  @Prop()
  language: string;

  @Prop()
  tables: Table[];

  @Prop()
  actions: Action[];

  @Prop()
  addons: Addon[];

  @Prop()
  product: [
    {
      id: string;
      priceId: string;
    },
  ];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
