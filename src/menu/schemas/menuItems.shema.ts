import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Category } from '../../category/schemas/category.schema';

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
  category: Category;
}

export const MenuItemsSchema = SchemaFactory.createForClass(MenuItems);
