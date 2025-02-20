import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Product {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  price: string;

  @Prop()
  discount: string;

  @Prop({
    type: {
      data: Buffer,
      contentType: String,
      filename: String,
    },
  })
  image?: {
    data: Buffer;
    contentType: string;
    filename: string;
  };

  @Prop({ type: String })
  imagePath?: string;

  @Prop({ type: [String], ref: 'Category' })
  categories: string[];

  @Prop({ type: [String], default: [] })
  ingredients: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
