import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { buildAuthUser } from '../test/factories/auth-user.factory';
import { buildCartItem } from '../test/factories/cart-item.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

type MockedCartService = {
  getCart: jest.Mock;
  addItem: jest.Mock;
  removeItem: jest.Mock;
  checkout: jest.Mock;
};

describe('CartController', () => {
  let controller: CartController;
  let cartService: MockedCartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getCart: jest.fn(),
            addItem: jest.fn(),
            removeItem: jest.fn(),
            checkout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CartController);
    cartService = module.get<MockedCartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getCart delegates to the service with the current user id', async () => {
    const user = buildAuthUser();
    const cartDto = { items: [], total: 0 };
    cartService.getCart.mockResolvedValue(cartDto);

    const result = await controller.getCart(user);

    expect(cartService.getCart).toHaveBeenCalledWith(user.userId);
    expect(result).toBe(cartDto);
  });

  it('addItem delegates to the service with the requested quantity', async () => {
    const user = buildAuthUser();
    const productId = faker.string.uuid();
    const itemDto = buildCartItem({ productId, quantity: 3 });
    cartService.addItem.mockResolvedValue(itemDto);

    const result = await controller.addItem(productId, { quantity: 3 }, user);

    expect(cartService.addItem).toHaveBeenCalledWith(user.userId, productId, 3);
    expect(result).toBe(itemDto);
  });

  it('removeItem delegates to the service with the user id and productId', async () => {
    const user = buildAuthUser();
    const productId = faker.string.uuid();
    cartService.removeItem.mockResolvedValue(undefined);

    await controller.removeItem(productId, user);

    expect(cartService.removeItem).toHaveBeenCalledWith(user.userId, productId);
  });

  it('checkout delegates to the service with the current user id', async () => {
    const user = buildAuthUser();
    cartService.checkout.mockResolvedValue(undefined);

    await controller.checkout(user);

    expect(cartService.checkout).toHaveBeenCalledWith(user.userId);
  });
});
