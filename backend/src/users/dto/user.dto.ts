import { User } from '../entities/user.entity';

export class UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.roles = (user.roles ?? []).map((role) => role.name);
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
