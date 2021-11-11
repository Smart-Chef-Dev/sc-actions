import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Addon extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  price: number;

  @Prop()
  weight: number;
}

export const AddonSchema = SchemaFactory.createForClass(Addon);
