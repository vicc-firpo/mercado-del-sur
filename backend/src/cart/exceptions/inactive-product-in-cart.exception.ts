import { BadRequestException } from '@nestjs/common';

export class InactiveProductInCartException extends BadRequestException {
  constructor(productIds: string[]) {
    super(`Cart contains unavailable products: ${productIds.join(', ')}`);
  }
}
