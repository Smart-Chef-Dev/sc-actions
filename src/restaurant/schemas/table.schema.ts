import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Table extends Document {
  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  name: string;

  @Prop([String])
  userIds: string[];
}

export const TableSchema = SchemaFactory.createForClass(Table);
