import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['ADMIN', 'STAFF'], default: 'STAFF', required: true })
  role: string;

  @Prop({ type: String, required: false })
  imageURL?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
