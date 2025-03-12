import { IsOptional, IsNumber, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class FindMemoriesDto {
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
}
