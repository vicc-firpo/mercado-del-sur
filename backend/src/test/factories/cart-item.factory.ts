import { faker } from '@faker-js/faker';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { buildProduct } from './product.factory';

export function buildCartItem(overrides: Partial<CartItem> = {}): CartItem {
  const item = new CartItem();
  item.id = faker.string.uuid();
  item.cartId = faker.string.uuid();
  item.productId = faker.string.uuid();
  item.product = buildProduct({ id: item.productId });
  item.quantity = faker.number.int({ min: 1, max: 10 });
  item.createdAt = faker.date.past();
  item.updatedAt = faker.date.recent();
  return Object.assign(item, overrides);
}
