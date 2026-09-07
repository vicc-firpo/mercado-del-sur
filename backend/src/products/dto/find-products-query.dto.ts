import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ProductStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

export class FindProductsQueryDto {
  @IsOptional()
  @IsEnum(ProductStatusFilter)
  status?: ProductStatusFilter;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
