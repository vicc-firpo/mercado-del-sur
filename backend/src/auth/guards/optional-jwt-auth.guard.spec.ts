import { buildAuthUser } from '../../test/factories/auth-user.factory';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  const guard = new OptionalJwtAuthGuard();

  it('returns undefined instead of throwing when there is no valid user', () => {
    expect(guard.handleRequest(new Error('no token'), false)).toBeUndefined();
    expect(guard.handleRequest(null, false)).toBeUndefined();
  });

  it('returns the user when authentication succeeded', () => {
    const user = buildAuthUser();
    expect(guard.handleRequest(null, user)).toBe(user);
  });
});
