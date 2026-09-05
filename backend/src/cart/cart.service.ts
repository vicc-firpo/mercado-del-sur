import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductNotFoundException } from '../products/exceptions/product-not-found.exception';
import { CartItemDto } from './dto/cart-item.dto';
import { CartDto } from './dto/cart.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { CartItemNotFoundException } from './exceptions/cart-item-not-found.exception';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
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

    await this.cartItemsRepository
      .createQueryBuilder()
      .insert()
      .into(CartItem)
      .values({ cartId: cart.id, productId, quantity })
      .orUpdate(['quantity'], ['cart_id', 'product_id'])
      .execute();

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

  async checkout(userId: string): Promise<void> {
    const cart = await this.getCartOrFail(userId);
    this.processPayment();
    await this.cartItemsRepository.delete({ cartId: cart.id });
  }

  private async getCartOrFail(userId: string): Promise<Cart> {
    const cart = await this.cartsRepository.findOne({
      where: { userId },
      relations: { items: { product: { images: true } } },
    });
    if (!cart) {
      throw new Error(`Cart not found for user ${userId}`);
    }
    return cart;
  }

  private async getCartItemOrFail(
    cartId: string,
    productId: string,
  ): Promise<CartItem> {
    const item = await this.cartItemsRepository.findOne({
      where: { cartId, productId },
      relations: { product: true },
    });
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
