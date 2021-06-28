import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Category } from '../../category/schemas/category.schema';
import { Modifiers } from './modifiers.shema';

@Schema()
export class MenuItems extends Document {
  @Prop()
  name: string;

  @Prop()
  pictureUrl: string;

  @Prop()
  price: string;

  @Prop()
  weight: string;

  @Prop()
  time: string;

  @Prop()
  description: string;

  @Prop()
  modifiers: Modifiers[];

  @Prop()
  category: Category;
}

export const MenuItemsSchema = SchemaFactory.createForClass(MenuItems);
