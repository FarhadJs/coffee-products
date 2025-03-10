import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductImage } from 'src/products/interfaces/product-image.interface';

export type MemoryDocument = Memory & Document;

@Schema({ timestamps: true })
export class Memory {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, maxlength: 200 })
  text: string;

  @Prop({ type: Object })
  image: ProductImage;

  @Prop({ type: String })
  imagePath: string;

  @Prop({ type: Boolean, default: false })
  isApproved: boolean;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);
