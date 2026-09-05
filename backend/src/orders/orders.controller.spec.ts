import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { buildAuthUser } from '../test/factories/auth-user.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

type MockedOrdersService = {
  findMyOrders: jest.Mock;
  findMyOrderDetail: jest.Mock;
};

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: MockedOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            findMyOrders: jest.fn(),
            findMyOrderDetail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(OrdersController);
    ordersService = module.get<MockedOrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findMyOrders delegates to the service with the current user id', async () => {
    const user = buildAuthUser();
    const orders = [{ id: faker.string.uuid(), total: 10, itemCount: 1 }];
    ordersService.findMyOrders.mockResolvedValue(orders);

    const result = await controller.findMyOrders(user);

    expect(ordersService.findMyOrders).toHaveBeenCalledWith(user.userId);
    expect(result).toBe(orders);
  });

  it('findOne delegates to the service with the user id and order id', async () => {
    const user = buildAuthUser();
    const orderId = faker.string.uuid();
    const detail = { id: orderId, total: 10, items: [] };
    ordersService.findMyOrderDetail.mockResolvedValue(detail);

    const result = await controller.findOne(orderId, user);

    expect(ordersService.findMyOrderDetail).toHaveBeenCalledWith(
      user.userId,
      orderId,
    );
    expect(result).toBe(detail);
  });
});
