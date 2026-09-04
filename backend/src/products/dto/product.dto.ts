import { Product } from '../entities/product.entity';
import { Currency } from '../enums/currency.enum';
import { ImageDto } from './image.dto';

export class ProductDto {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  images: ImageDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(product: Product): ProductDto {
    const dto = new ProductDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.price = Number(product.price);
    dto.currency = product.currency;
    dto.images = (product.images ?? []).map((image) =>
      ImageDto.fromEntity(image),
    );
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    return dto;
  }
}
