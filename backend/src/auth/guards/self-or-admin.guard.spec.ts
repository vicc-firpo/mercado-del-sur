import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthUser } from '../jwt-payload.interface';
import { RoleName } from '../../users/enums/role-name.enum';
import { buildAuthUser } from '../../test/factories/auth-user.factory';
import { SelfOrAdminGuard } from './self-or-admin.guard';

function createContext(user: AuthUser, paramId: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, params: { id: paramId } }),
    }),
  } as unknown as ExecutionContext;
}

describe('SelfOrAdminGuard', () => {
  const guard = new SelfOrAdminGuard();

  it('allows an admin to access any user record', () => {
    const admin = buildAuthUser({ role: RoleName.ADMIN });
    const context = createContext(admin, 'someone-else');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a user to access their own record', () => {
    const user = buildAuthUser({ role: RoleName.CUSTOMER });
    const context = createContext(user, user.userId);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException for a customer accessing another user record', () => {
    const user = buildAuthUser({ role: RoleName.CUSTOMER });
    const context = createContext(user, 'someone-else');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
