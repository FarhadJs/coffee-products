import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { Transform } from 'class-transformer';

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Product {
  @Prop({ required: true, trim: true })
  product_name: string;

  @Prop({ required: true })
  image_url: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, trim: true })
  product_details: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
