import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { ProductImage } from '../interfaces/product-image.interface';

export class CreateProductDto {
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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];
}
