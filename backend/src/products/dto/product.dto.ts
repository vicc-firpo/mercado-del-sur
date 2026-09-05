import { Product } from '../entities/product.entity';
import { ImageDto } from './image.dto';

export class ProductDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  images: ImageDto[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(product: Product): ProductDto {
    const dto = new ProductDto();
    dto.id = product.id;
    dto.name = product.name;
    dto.description = product.description;
    dto.price = Number(product.price);
    dto.active = product.isActive;
    dto.images = (product.images ?? []).map((image) =>
      ImageDto.fromEntity(image),
    );
    dto.createdAt = product.createdAt;
    dto.updatedAt = product.updatedAt;
    return dto;
  }
}
