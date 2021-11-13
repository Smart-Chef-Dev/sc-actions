import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Action extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  link: string;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
