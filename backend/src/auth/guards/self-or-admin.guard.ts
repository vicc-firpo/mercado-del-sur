import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../jwt-payload.interface';
import { RoleName } from '../../users/enums/role-name.enum';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthUser; params: { id: string } }>();
    const { user, params } = request;

    if (user.role === RoleName.ADMIN || user.userId === params.id) {
      return true;
    }
    throw new ForbiddenException('You can only access your own user record');
  }
}
