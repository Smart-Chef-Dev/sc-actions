import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Table } from './table.schema';

@Schema()
export class Restaurant extends Document {
  @Prop({ required: true })
  name: string;

  @Prop([String])
  usernames: string[];

  @Prop()
  tables: Table[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
