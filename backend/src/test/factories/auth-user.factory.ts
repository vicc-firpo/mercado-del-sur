import { faker } from '@faker-js/faker';
import { AuthUser } from '../../auth/jwt-payload.interface';
import { RoleName } from '../../users/enums/role-name.enum';

export function buildAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    userId: faker.string.uuid(),
    email: faker.internet.email(),
    role: RoleName.CUSTOMER,
    ...overrides,
  };
}
