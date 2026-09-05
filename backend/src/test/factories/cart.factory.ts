import { faker } from '@faker-js/faker';
import { Cart } from '../../cart/entities/cart.entity';

export function buildCart(overrides: Partial<Cart> = {}): Cart {
  const cart = new Cart();
  cart.id = faker.string.uuid();
  cart.userId = faker.string.uuid();
  cart.items = [];
  cart.createdAt = faker.date.past();
  cart.updatedAt = faker.date.recent();
  return Object.assign(cart, overrides);
}
