import { BadRequestException } from '@nestjs/common';

export class EmptyCartException extends BadRequestException {
  constructor() {
    super('Cannot checkout an empty cart');
  }
}
