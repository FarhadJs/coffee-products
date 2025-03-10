import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ProductImage } from 'src/products/interfaces/product-image.interface';

export class CreateMemoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  text: string;

  @IsOptional()
  @IsObject()
  image: ProductImage;

  @IsString()
  @IsOptional()
  imagePath?: string;
}
