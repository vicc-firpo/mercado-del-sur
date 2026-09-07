import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../cart/entities/cart-item.entity';
import { OrderDetailDto } from './dto/order-detail.dto';
import { OrderSummaryDto } from './dto/order-summary.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderNotFoundException } from './exceptions/order-not-found.exception';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async createOrder(userId: string, cartItems: CartItem[]): Promise<Order> {
    const items = cartItems.map((cartItem) => this.buildOrderItem(cartItem));
    const total = items
      .reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
      .toFixed(2);

    return this.ordersRepository.save(
      this.ordersRepository.create({ userId, total, items }),
    );
  }

  async findMyOrders(userId: string): Promise<OrderSummaryDto[]> {
    const orders = await this.ordersRepository.find({
      where: { userId, isPaid: true },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
    return orders.map((order) => OrderSummaryDto.fromEntity(order));
  }

  findById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id } });
  }

  findByCheckoutSessionId(sessionId: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { stripeCheckoutSessionId: sessionId },
    });
  }

  async attachCheckoutSession(
    orderId: string,
    sessionId: string,
  ): Promise<void> {
    await this.ordersRepository.update(
      { id: orderId },
      { stripeCheckoutSessionId: sessionId },
    );
  }

  async markAsPaid(orderId: string): Promise<boolean> {
    const result = await this.ordersRepository.update(
      { id: orderId, isPaid: false },
      { isPaid: true },
    );
    return (result.affected ?? 0) > 0;
  }

  async findMyOrderDetail(
    userId: string,
    orderId: string,
  ): Promise<OrderDetailDto> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, userId },
      relations: { items: true },
    });
    if (!order) {
      throw new OrderNotFoundException(orderId);
    }
    return OrderDetailDto.fromEntity(order);
  }

  private buildOrderItem(cartItem: CartItem): OrderItem {
    const item = new OrderItem();
    item.productName = cartItem.product.name;
    item.productDescription = cartItem.product.description;
    item.unitPrice = cartItem.product.price;
    item.quantity = cartItem.quantity;
    return item;
  }
}
