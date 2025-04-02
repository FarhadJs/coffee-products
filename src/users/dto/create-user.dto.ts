import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsObject,
} from 'class-validator';
import { ProductImage } from 'src/products/interfaces/product-image.interface';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsObject()
  image?: ProductImage;

  @IsString()
  @IsOptional()
  imagePath?: string;

  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsOptional()
  position: string;

  @IsString()
  @IsOptional()
  social_link: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password is too weak',
  })
  password: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
