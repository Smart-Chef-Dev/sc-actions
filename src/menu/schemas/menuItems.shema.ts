import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Category } from '../../category/schemas/category.schema';
import { Addon } from '../../restaurant/schemas/addon.shema';

@Schema()
export class MenuItems extends Document {
  @Prop()
  name: string;

  @Prop()
  pictureUrl: string;

  @Prop()
  pictureLqipPreview: string;

  @Prop()
  price: number;

  @Prop()
  weight: number;

  @Prop()
  time: number;

  @Prop()
  description: string;

  @Prop()
  addons: Addon[];

  @Prop()
  n: number;

  @Prop()
  category: Category;
}

export const MenuItemsSchema = SchemaFactory.createForClass(MenuItems);
