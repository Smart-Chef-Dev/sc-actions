import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Addon extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number })
  price: number;

  @Prop({ type: Number })
  weight: number;
}

export const AddonSchema = SchemaFactory.createForClass(Addon);
