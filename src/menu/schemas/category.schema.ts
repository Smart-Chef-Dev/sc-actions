import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Restaurant } from '../../restaurant/schemas/restaurant.schema';
import * as mongoose from 'mongoose';

@Schema()
export class Category extends Document {
  @Prop()
  category: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
  restaurant: Restaurant;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
