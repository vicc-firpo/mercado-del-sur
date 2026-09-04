import { IsEnum, IsOptional } from 'class-validator';

export enum ProductStatusFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ALL = 'all',
}

export class FindProductsQueryDto {
  @IsOptional()
  @IsEnum(ProductStatusFilter)
  status?: ProductStatusFilter;
}
