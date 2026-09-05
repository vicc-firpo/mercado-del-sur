import { NotFoundException } from '@nestjs/common';

export class CartItemNotFoundException extends NotFoundException {
  constructor(productId: string) {
    super(`Product ${productId} is not in the cart`);
  }
}
