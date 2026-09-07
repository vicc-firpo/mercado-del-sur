import { Order } from '../entities/order.entity';
import { OrderItemDto } from './order-item.dto';

export class OrderDetailDto {
  id: string;
  total: number;
  isPaid: boolean;
  createdAt: Date;
  items: OrderItemDto[];

  static fromEntity(order: Order): OrderDetailDto {
    const dto = new OrderDetailDto();
    dto.id = order.id;
    dto.total = Number(order.total);
    dto.isPaid = order.isPaid;
    dto.createdAt = order.createdAt;
    dto.items = (order.items ?? []).map((item) =>
      OrderItemDto.fromEntity(item),
    );
    return dto;
  }
}
