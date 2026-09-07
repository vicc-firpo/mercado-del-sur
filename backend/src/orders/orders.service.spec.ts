import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { buildCartItem } from '../test/factories/cart-item.factory';
import { buildOrder } from '../test/factories/order.factory';
import { buildOrderItem } from '../test/factories/order-item.factory';
import { buildProduct } from '../test/factories/product.factory';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderNotFoundException } from './exceptions/order-not-found.exception';

type MockedOrdersRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
};

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: MockedOrdersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(OrdersService);
    ordersRepository = module.get<MockedOrdersRepository>(
      getRepositoryToken(Order),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('snapshots each cart item and persists the order with its computed total', async () => {
      const userId = faker.string.uuid();
      const first = buildCartItem({
        product: buildProduct({
          name: 'Mate',
          description: 'Imperial',
          price: '10.00',
        }),
        quantity: 2,
      });
      const second = buildCartItem({
        product: buildProduct({
          name: 'Bombilla',
          description: null,
          price: '5.50',
        }),
        quantity: 1,
      });
      const built = buildOrder({ userId });
      ordersRepository.create.mockReturnValue(built);
      ordersRepository.save.mockResolvedValue(built);

      await service.createOrder(userId, [first, second]);

      expect(ordersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          total: '25.50',
          items: [
            expect.objectContaining({
              productName: 'Mate',
              productDescription: 'Imperial',
              unitPrice: '10.00',
              quantity: 2,
            }),
            expect.objectContaining({
              productName: 'Bombilla',
              productDescription: null,
              unitPrice: '5.50',
              quantity: 1,
            }),
          ],
        }),
      );
      expect(ordersRepository.save).toHaveBeenCalledWith(built);
    });
  });

  describe('findMyOrders', () => {
    it('returns a paid-only summary per order ordered by newest first', async () => {
      const userId = faker.string.uuid();
      const order = buildOrder({
        userId,
        total: '30.00',
        items: [buildOrderItem(), buildOrderItem()],
      });
      ordersRepository.find.mockResolvedValue([order]);

      const result = await service.findMyOrders(userId);

      expect(ordersRepository.find).toHaveBeenCalledWith({
        where: { userId, isPaid: true },
        relations: { items: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([
        {
          id: order.id,
          total: 30,
          itemCount: 2,
          isPaid: true,
          createdAt: order.createdAt,
        },
      ]);
    });
  });

  describe('markAsPaid', () => {
    it('flips an unpaid order and reports the transition', async () => {
      ordersRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.markAsPaid('order-1');

      expect(ordersRepository.update).toHaveBeenCalledWith(
        { id: 'order-1', isPaid: false },
        { isPaid: true },
      );
      expect(result).toBe(true);
    });

    it('reports no transition when the order was already paid', async () => {
      ordersRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.markAsPaid('order-1')).resolves.toBe(false);
    });
  });

  describe('attachCheckoutSession', () => {
    it('stores the Stripe session id on the order', async () => {
      ordersRepository.update.mockResolvedValue({ affected: 1 });

      await service.attachCheckoutSession('order-1', 'cs_test_123');

      expect(ordersRepository.update).toHaveBeenCalledWith(
        { id: 'order-1' },
        { stripeCheckoutSessionId: 'cs_test_123' },
      );
    });
  });

  describe('findById', () => {
    it('looks up an order without scoping by user', async () => {
      const order = buildOrder();
      ordersRepository.findOne.mockResolvedValue(order);

      const result = await service.findById(order.id);

      expect(ordersRepository.findOne).toHaveBeenCalledWith({
        where: { id: order.id },
      });
      expect(result).toBe(order);
    });
  });

  describe('findByCheckoutSessionId', () => {
    it('looks up an order by its Stripe checkout session id', async () => {
      const order = buildOrder({ stripeCheckoutSessionId: 'cs_test_123' });
      ordersRepository.findOne.mockResolvedValue(order);

      const result = await service.findByCheckoutSessionId('cs_test_123');

      expect(ordersRepository.findOne).toHaveBeenCalledWith({
        where: { stripeCheckoutSessionId: 'cs_test_123' },
      });
      expect(result).toBe(order);
    });
  });

  describe('findMyOrderDetail', () => {
    it('returns the order with its items', async () => {
      const userId = faker.string.uuid();
      const item = buildOrderItem({ unitPrice: '10.00', quantity: 3 });
      const order = buildOrder({ userId, total: '30.00', items: [item] });
      ordersRepository.findOne.mockResolvedValue(order);

      const result = await service.findMyOrderDetail(userId, order.id);

      expect(ordersRepository.findOne).toHaveBeenCalledWith({
        where: { id: order.id, userId },
        relations: { items: true },
      });
      expect(result.id).toBe(order.id);
      expect(result.total).toBe(30);
      expect(result.items).toEqual([
        {
          productName: item.productName,
          productDescription: item.productDescription,
          unitPrice: 10,
          quantity: 3,
          subtotal: 30,
        },
      ]);
    });

    it('throws OrderNotFoundException when the order does not exist or belongs to another user', async () => {
      ordersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findMyOrderDetail(faker.string.uuid(), faker.string.uuid()),
      ).rejects.toThrow(OrderNotFoundException);
    });
  });
});
