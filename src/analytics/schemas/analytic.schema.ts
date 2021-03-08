import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { AnalyticType } from '../enums/analytic-type.enum';

@Schema()
export class Analytic extends Document {
  @Prop()
  restaurantId: string;

  @Prop()
  actionId: string;

  @Prop()
  tableId: string;

  @Prop({ required: true })
  type: AnalyticType;
}

export const AnalyticSchema = SchemaFactory.createForClass(Analytic);
