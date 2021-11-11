import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Restaurant } from '../../restaurant/schemas/restaurant.schema';

@Schema()
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  order: number;

  @Prop({ required: true })
  restaurant: Restaurant;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
