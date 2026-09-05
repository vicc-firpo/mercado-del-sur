import { ProductDto } from '../../products/dto/product.dto';
import { CartItem } from '../entities/cart-item.entity';

export class CartItemDto {
  product: ProductDto;
  quantity: number;
  subtotal: number;

  static fromEntity(item: CartItem): CartItemDto {
    const dto = new CartItemDto();
    dto.product = ProductDto.fromEntity(item.product);
    dto.quantity = item.quantity;
    dto.subtotal = Number(item.product.price) * item.quantity;
    return dto;
  }
}
