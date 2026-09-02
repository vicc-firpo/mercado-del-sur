import { NotFoundException } from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Product ${id} not found`);
  }
}
