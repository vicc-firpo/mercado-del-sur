import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartItemsRepository extends Repository<CartItem> {
  constructor(dataSource: DataSource) {
    super(CartItem, dataSource.createEntityManager());
  }

  async upsertQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into(CartItem)
      .values({ cartId, productId, quantity })
      .orUpdate(['quantity'], ['cart_id', 'product_id'])
      .execute();
  }

  findOneWithProduct(
    cartId: string,
    productId: string,
  ): Promise<CartItem | null> {
    return this.findOne({
      where: { cartId, productId },
      relations: { product: true },
    });
  }
}
