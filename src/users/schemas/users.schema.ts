import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Users extends Document {
  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  subscription: string;

  @Prop()
  telegramId: string;

  @Prop()
  restaurantId: string;

  @Prop()
  name: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
