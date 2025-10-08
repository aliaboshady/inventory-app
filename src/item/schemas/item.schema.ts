import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Category, CategorySchema } from 'src/category/schemas/category.schema';

@Schema({ timestamps: true })
export class Item extends Document {
  @Prop({ required: true })
  name: string;

  // type = category object
  @Prop({ type: CategorySchema, required: true })
  type: Category;

  // attributes with chosen value
  @Prop({
    type: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    default: [],
  })
  attributes: { name: string; value: string }[];

  @Prop({ enum: ['IN_WAREHOUSE', 'OUT_OF_WAREHOUSE'], default: 'IN_WAREHOUSE' })
  status: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
