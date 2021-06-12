import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { Category } from '../../category/schemas/category.schema';
import * as mongoose from 'mongoose';
import { Restaurant } from '../../restaurant/schemas/restaurant.schema';

@Schema()
export class Course extends Document {
  @Prop()
  name: string;

  @Prop()
  picture: string;

  @Prop()
  price: string;

  @Prop()
  weight: string;

  @Prop()
  time: string;

  @Prop()
  description: string;

  @Prop()
  category: Category;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' })
  restaurant: Restaurant;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
