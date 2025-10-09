import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from 'src/category/schemas/category.schema';
import { Attribute } from 'src/attribute/schemas/attribute.schema';

@Schema({ timestamps: true })
export class Item extends Document {
  // ✅ Reference to the category
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  type: Category;

  // ✅ Attributes (reference + optional value)
  @Prop({
    type: [
      {
        attribute: { type: Types.ObjectId, ref: 'Attribute', required: true },
        value: { type: String, required: false },
      },
    ],
    default: [],
  })
  attributes: { attribute: Attribute; value?: string }[];

  // ✅ Item status
  @Prop({
    enum: ['IN_WAREHOUSE', 'OUT_OF_WAREHOUSE', 'UNKNOWN'],
    default: 'IN_WAREHOUSE',
  })
  status: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
