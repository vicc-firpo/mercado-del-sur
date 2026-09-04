import { faker } from '@faker-js/faker';
import { User } from '../../users/entities/user.entity';
import { RoleName } from '../../users/enums/role-name.enum';

export function buildUser(overrides: Partial<User> = {}): User {
  const user = new User();
  user.id = faker.string.uuid();
  user.firstName = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.role = RoleName.CUSTOMER;
  user.createdAt = faker.date.past();
  user.updatedAt = faker.date.recent();
  return Object.assign(user, overrides);
}
