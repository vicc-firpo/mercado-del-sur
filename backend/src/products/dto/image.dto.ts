import { Image } from '../entities/image.entity';
import { ImageExtension } from '../enums/image-extension.enum';

export class ImageDto {
  id: string;
  extension: ImageExtension;
  url: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(image: Image): ImageDto {
    const dto = new ImageDto();
    dto.id = image.id;
    dto.extension = image.extension;
    dto.productId = image.productId;
    dto.url = `/products/${image.productId}/images/${image.id}`;
    dto.createdAt = image.createdAt;
    dto.updatedAt = image.updatedAt;
    return dto;
  }
}
