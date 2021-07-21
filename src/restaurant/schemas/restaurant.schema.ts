import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Table } from './table.schema';
import { Action } from './action.schema';

@Schema()
export class Restaurant extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  currencyCode: string;

  @Prop([String])
  usernames: string[];

  @Prop()
  tables: Table[];

  @Prop()
  actions: Action[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
