import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Modifiers extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  price: string;
}

export const ModifiersSchema = SchemaFactory.createForClass(Modifiers);
