import { faker } from '@faker-js/faker';
import { OrderItem } from '../../orders/entities/order-item.entity';

export function buildOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  const item = new OrderItem();
  item.id = faker.string.uuid();
  item.orderId = faker.string.uuid();
  item.productName = faker.commerce.productName();
  item.productDescription = faker.commerce.productDescription();
  item.unitPrice = faker.commerce.price();
  item.quantity = faker.number.int({ min: 1, max: 10 });
  item.createdAt = faker.date.past();
  return Object.assign(item, overrides);
}
