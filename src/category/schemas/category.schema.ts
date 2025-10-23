import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Attribute } from 'src/attribute/schemas/attribute.schema';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, required: false })
  imageURL?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attribute' }], default: [] })
  attributes: Attribute[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
