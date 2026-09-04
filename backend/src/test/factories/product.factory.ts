import { faker } from '@faker-js/faker';
import { Product } from '../../products/entities/product.entity';
import { Currency } from '../../products/enums/currency.enum';

export function buildProduct(overrides: Partial<Product> = {}): Product {
  const product = new Product();
  product.id = faker.string.uuid();
  product.name = faker.commerce.productName();
  product.description = faker.commerce.productDescription();
  product.price = faker.commerce.price();
  product.currency = Currency.USD;
  product.isActive = true;
  product.images = [];
  product.createdAt = faker.date.past();
  product.updatedAt = faker.date.recent();
  return Object.assign(product, overrides);
}
