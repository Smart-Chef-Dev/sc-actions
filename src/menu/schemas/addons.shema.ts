import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Addons extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  price: string;
}

export const AddonsSchema = SchemaFactory.createForClass(Addons);
