import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Table extends Document {
  @Prop({ type: String })
  number: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  userIds: string[];
}

export const TableSchema = SchemaFactory.createForClass(Table);
