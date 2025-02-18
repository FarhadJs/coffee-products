import {
  IsOptional,
  IsNumber,
  Min,
  IsString,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FindProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsPositive()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  category?: string;
}
