import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Category } from '../../category/schemas/category.schema';
import { Addons } from './addons.shema';

@Schema()
export class MenuItems extends Document {
  @Prop({ required: true })
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
  addons: Addons[];

  @Prop({ required: true })
  category: Category;
}

export const MenuItemsSchema = SchemaFactory.createForClass(MenuItems);
