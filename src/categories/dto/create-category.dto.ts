// src/categories/dto/create-category.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'slug is required' })
  slug: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
