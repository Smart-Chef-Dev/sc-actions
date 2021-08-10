import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Restaurant } from '../../restaurant/schemas/restaurant.schema';

@Schema()
export class Category extends Document {
  @Prop()
  name: string;

  @Prop()
  n: number;

  @Prop()
  restaurant: Restaurant;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
