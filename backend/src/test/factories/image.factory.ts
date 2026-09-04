import { faker } from '@faker-js/faker';
import { Image } from '../../products/entities/image.entity';
import { Product } from '../../products/entities/product.entity';
import { ImageExtension } from '../../products/enums/image-extension.enum';
import { buildProduct } from './product.factory';

export function buildImage(overrides: Partial<Image> = {}): Image {
  const image = new Image();
  image.id = faker.string.uuid();
  image.extension = ImageExtension.JPG;
  image.productId = faker.string.uuid();
  image.product = undefined as unknown as Product;
  image.createdAt = faker.date.past();
  image.updatedAt = faker.date.recent();
  return Object.assign(image, overrides);
}

export function buildImageWithProduct(
  productOverrides: Partial<Product> = {},
  imageOverrides: Partial<Image> = {},
): Image {
  const product = buildProduct(productOverrides);
  return buildImage({ productId: product.id, product, ...imageOverrides });
}
