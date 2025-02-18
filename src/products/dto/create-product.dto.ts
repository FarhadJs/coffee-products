import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { ProductImage } from '../interfaces/product-image.interface';
// import { Types } from 'mongoose';
// import { ALLOWED_CATEGORIES } from '../../common/constants/categories.constant';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  image?: ProductImage;

  @IsString()
  imagePath: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];
  // categories?: (typeof ALLOWED_CATEGORIES)[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];
}
