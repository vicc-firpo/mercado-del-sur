import { ConflictException } from '@nestjs/common';

export class EmailAlreadyInUseException extends ConflictException {
  constructor(email: string) {
    super(`Email ${email} is already in use`);
  }
}
