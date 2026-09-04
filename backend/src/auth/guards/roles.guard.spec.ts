import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser } from '../jwt-payload.interface';
import { RoleName } from '../../users/enums/role-name.enum';
import { buildAuthUser } from '../../test/factories/auth-user.factory';
import { RolesGuard } from './roles.guard';

function createContext(user?: AuthUser): ExecutionContext {
  return {
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows the request when the route has no @Roles metadata', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('throws UnauthorizedException when roles are required but there is no user', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RoleName.ADMIN]);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(
      UnauthorizedException,
    );
  });

  it('throws ForbiddenException when the user role is not allowed', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RoleName.ADMIN]);
    const context = createContext(buildAuthUser({ role: RoleName.CUSTOMER }));
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows the request when the user role is allowed', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([RoleName.ADMIN]);
    const context = createContext(buildAuthUser({ role: RoleName.ADMIN }));
    expect(guard.canActivate(context)).toBe(true);
  });
});
