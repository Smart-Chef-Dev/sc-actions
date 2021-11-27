import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  priceId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
