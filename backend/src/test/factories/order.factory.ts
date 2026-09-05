import { faker } from '@faker-js/faker';
import { Order } from '../../orders/entities/order.entity';

export function buildOrder(overrides: Partial<Order> = {}): Order {
  const order = new Order();
  order.id = faker.string.uuid();
  order.userId = faker.string.uuid();
  order.total = faker.commerce.price();
  order.items = [];
  order.createdAt = faker.date.past();
  return Object.assign(order, overrides);
}
