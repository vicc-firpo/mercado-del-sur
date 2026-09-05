import { OrderItem } from '../entities/order-item.entity';

export class OrderItemDto {
  productName: string;
  productDescription: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;

  static fromEntity(item: OrderItem): OrderItemDto {
    const dto = new OrderItemDto();
    dto.productName = item.productName;
    dto.productDescription = item.productDescription;
    dto.unitPrice = Number(item.unitPrice);
    dto.quantity = item.quantity;
    dto.subtotal = Number(item.unitPrice) * item.quantity;
    return dto;
  }
}
