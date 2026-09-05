import { Cart } from '../entities/cart.entity';
import { CartItemDto } from './cart-item.dto';

export class CartDto {
  items: CartItemDto[];
  total: number;

  static fromEntity(cart: Cart): CartDto {
    const dto = new CartDto();
    dto.items = (cart.items ?? []).map((item) => CartItemDto.fromEntity(item));
    dto.total = dto.items.reduce((sum, item) => sum + item.subtotal, 0);
    return dto;
  }
}
