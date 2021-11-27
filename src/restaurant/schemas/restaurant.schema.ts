import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Product } from './product.schema';
import { Table, TableSchema } from './table.schema';
import { Action, ActionSchema } from './action.schema';
import { Addon, AddonSchema } from './addon.shema';

const DEFAULT_LANGUAGE = 'ru';
const DEFAULT_CURRENCY_CODE = 'RUB';

@Schema()
export class Restaurant extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: DEFAULT_CURRENCY_CODE })
  currencyCode: string;

  @Prop({ type: String, default: DEFAULT_LANGUAGE })
  language: string;

  @Prop({ type: [TableSchema], default: [] })
  tables: Table[];

  @Prop({ type: [ActionSchema], default: [] })
  actions: Action[];

  @Prop({ type: [AddonSchema], default: [] })
  addons: Addon[];

  @Prop()
  products: Product[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
