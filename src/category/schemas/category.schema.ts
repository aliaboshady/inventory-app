import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Attribute } from 'src/attribute/schemas/attribute.schema';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name: string;

  // ✅ Parent category (null for top-level)
  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parent: Category | null;

  // ✅ Attributes (only used by subcategories)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attribute' }], default: [] })
  attributes: Attribute[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
