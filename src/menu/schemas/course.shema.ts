import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { Category } from './category.schema';

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
  category: Category[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
