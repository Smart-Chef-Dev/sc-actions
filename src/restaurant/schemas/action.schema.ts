import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Action extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  link: string;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
