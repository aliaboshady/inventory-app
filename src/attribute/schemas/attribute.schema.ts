import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Attribute extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  options: string[];
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);
