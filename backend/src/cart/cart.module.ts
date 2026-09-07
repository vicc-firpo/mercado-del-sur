import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { CartItemsRepository } from './cart-items.repository';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartsRepository } from './carts.repository';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, Product])],
  controllers: [CartController],
  providers: [CartService, CartsRepository, CartItemsRepository],
  exports: [CartService],
})
export class CartModule {}
