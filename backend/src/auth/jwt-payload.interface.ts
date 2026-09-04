import { RoleName } from '../users/enums/role-name.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleName;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: RoleName;
}
