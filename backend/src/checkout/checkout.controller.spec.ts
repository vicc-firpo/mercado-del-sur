import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));

import { buildAuthUser } from '../test/factories/auth-user.factory';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

describe('CheckoutController', () => {
  let controller: CheckoutController;
  let checkoutService: { startCheckout: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckoutController],
      providers: [
        { provide: CheckoutService, useValue: { startCheckout: jest.fn() } },
      ],
    }).compile();

    controller = module.get(CheckoutController);
    checkoutService = module.get(CheckoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to the service with the current user id', async () => {
    const user = buildAuthUser();
    const session = {
      orderId: faker.string.uuid(),
      checkoutUrl: 'https://stripe.test/pay',
    };
    checkoutService.startCheckout.mockResolvedValue(session);

    const result = await controller.startCheckout(user);

    expect(checkoutService.startCheckout).toHaveBeenCalledWith(user.userId);
    expect(result).toBe(session);
  });
});
