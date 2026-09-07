import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsRepository extends Repository<Cart> {
  constructor(dataSource: DataSource) {
    super(Cart, dataSource.createEntityManager());
  }

  findOneByUserWithItems(userId: string): Promise<Cart | null> {
    return this.findOne({
      where: { userId },
      relations: { items: { product: { images: true } } },
    });
  }
}
