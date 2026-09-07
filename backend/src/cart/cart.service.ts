import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetailDto } from '../orders/dto/order-detail.dto';
import { OrdersService } from '../orders/orders.service';
import { Product } from '../products/entities/product.entity';
import { ProductNotFoundException } from '../products/exceptions/product-not-found.exception';
import { CartItemsRepository } from './cart-items.repository';
import { CartsRepository } from './carts.repository';
import { CartItemDto } from './dto/cart-item.dto';
import { CartDto } from './dto/cart.dto';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartItemNotFoundException } from './exceptions/cart-item-not-found.exception';
import { EmptyCartException } from './exceptions/empty-cart.exception';

@Injectable()
export class CartService {
  constructor(
    private readonly cartsRepository: CartsRepository,
    private readonly cartItemsRepository: CartItemsRepository,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly ordersService: OrdersService,
  ) {}

  async createCartForUser(userId: string): Promise<Cart> {
    return this.cartsRepository.save(this.cartsRepository.create({ userId }));
  }

  async getCart(userId: string): Promise<CartDto> {
    return CartDto.fromEntity(await this.getCartOrFail(userId));
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItemDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new ProductNotFoundException(productId);
    }
    const cart = await this.getCartOrFail(userId);

    await this.cartItemsRepository.upsertQuantity(cart.id, productId, quantity);

    const item = await this.getCartItemOrFail(cart.id, productId);
    return CartItemDto.fromEntity(item);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const cart = await this.getCartOrFail(userId);
    const result = await this.cartItemsRepository.delete({
      cartId: cart.id,
      productId,
    });
    if (!result.affected) {
      throw new CartItemNotFoundException(productId);
    }
  }

  async checkout(userId: string): Promise<OrderDetailDto> {
    const cart = await this.getCartOrFail(userId);
    if (!cart.items?.length) {
      throw new EmptyCartException();
    }
    this.processPayment();
    const order = await this.ordersService.createOrder(userId, cart.items);
    await this.cartItemsRepository.delete({ cartId: cart.id });
    return OrderDetailDto.fromEntity(order);
  }

  private async getCartOrFail(userId: string): Promise<Cart> {
    const cart = await this.cartsRepository.findOneByUserWithItems(userId);
    if (!cart) {
      throw new Error(`Cart not found for user ${userId}`);
    }
    return cart;
  }

  private async getCartItemOrFail(
    cartId: string,
    productId: string,
  ): Promise<CartItem> {
    const item = await this.cartItemsRepository.findOneWithProduct(
      cartId,
      productId,
    );
    if (!item) {
      throw new CartItemNotFoundException(productId);
    }
    return item;
  }

  /**
   * Stub: any checkout attempt is accepted as a valid payment for now.
   * TODO(future): integrate a real payment gateway and persist the purchase record.
   */
  private processPayment(): void {}
}
