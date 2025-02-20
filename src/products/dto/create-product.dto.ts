import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import { ProductImage } from '../interfaces/product-image.interface';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  price: string;

  @IsString()
  @IsOptional()
  discount: string;

  @IsOptional()
  @IsObject()
  image?: ProductImage;

  @IsString()
  @IsOptional()
  imagePath?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];
}
