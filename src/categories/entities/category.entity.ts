import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
