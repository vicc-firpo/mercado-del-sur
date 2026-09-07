import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductNotFoundException } from '../products/exceptions/product-not-found.exception';
import { CartItemsRepository } from './cart-items.repository';
import { CartsRepository } from './carts.repository';
import { CartItemDto } from './dto/cart-item.dto';
import { CartDto } from './dto/cart.dto';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartItemNotFoundException } from './exceptions/cart-item-not-found.exception';

@Injectable()
export class CartService {
  constructor(
    private readonly cartsRepository: CartsRepository,
    private readonly cartItemsRepository: CartItemsRepository,
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
      where: { id: productId, isActive: true },
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

  getCartForCheckout(userId: string): Promise<Cart> {
    return this.getCartOrFail(userId);
  }

  async removeProductFromAllCarts(
    productId: string,
    manager?: EntityManager,
  ): Promise<void> {
    await this.cartItemsRepository.deleteByProductId(productId, manager);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCartOrFail(userId);
    await this.cartItemsRepository.delete({ cartId: cart.id });
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
}
