import { Order } from '../entities/order.entity';

export class OrderSummaryDto {
  id: string;
  total: number;
  itemCount: number;
  isPaid: boolean;
  createdAt: Date;

  static fromEntity(order: Order): OrderSummaryDto {
    const dto = new OrderSummaryDto();
    dto.id = order.id;
    dto.total = Number(order.total);
    dto.itemCount = (order.items ?? []).length;
    dto.isPaid = order.isPaid;
    dto.createdAt = order.createdAt;
    return dto;
  }
}
