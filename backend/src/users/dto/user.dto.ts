import { User } from '../entities/user.entity';
import { RoleName } from '../enums/role-name.enum';

export class UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.role = user.role;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
