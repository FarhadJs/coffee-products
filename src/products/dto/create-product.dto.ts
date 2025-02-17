import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { ProductImage } from '../interfaces/product-image.interface';
import { Types } from 'mongoose';
import { ALLOWED_CATEGORIES } from '../../common/constants/categories.constant';

export class CreateProductDto {
  _id: Types.ObjectId;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  image?: ProductImage;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: string[];
  // categories?: (typeof ALLOWED_CATEGORIES)[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];
}
