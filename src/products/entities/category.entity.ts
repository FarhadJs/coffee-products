// src/products/entities/category.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = (ret._id as Types.ObjectId).toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Category {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  image?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
