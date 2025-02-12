import { IsNotEmpty, IsNumber, IsString, IsUrl, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  product_name: string;

  @IsUrl()
  image_url: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  product_details: string;
}
