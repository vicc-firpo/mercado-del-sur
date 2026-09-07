import { Inject, InjectionToken } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { faker } from '@faker-js/faker';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));

import { CartService } from '../cart/cart.service';
import { EmptyCartException } from '../cart/exceptions/empty-cart.exception';
import { InactiveProductInCartException } from '../cart/exceptions/inactive-product-in-cart.exception';
import { buildCart } from '../test/factories/cart.factory';
import { buildCartItem } from '../test/factories/cart-item.factory';
import { buildProduct } from '../test/factories/product.factory';
import { buildOrder } from '../test/factories/order.factory';
import { OrdersService } from '../orders/orders.service';
import { StripeService } from '../stripe/stripe.service';
import { CheckoutService } from './checkout.service';

type MockedCartService = {
  getCartForCheckout: jest.Mock;
  clearCart: jest.Mock;
};

type MockedOrdersService = {
  createOrder: jest.Mock;
  attachCheckoutSession: jest.Mock;
  markAsPaid: jest.Mock;
  findById: jest.Mock;
  findByCheckoutSessionId: jest.Mock;
};

type MockedStripeService = {
  createCheckoutSession: jest.Mock;
};

const completedEvent = (
  session: Partial<Stripe.Checkout.Session>,
): Stripe.Event =>
  ({
    type: 'checkout.session.completed',
    data: { object: session },
  }) as Stripe.Event;

describe('CheckoutService', () => {
  let service: CheckoutService;
  let cartService: MockedCartService;
  let ordersService: MockedOrdersService;
  let stripeService: MockedStripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: CartService,
          useValue: {
            getCartForCheckout: jest.fn(),
            clearCart: jest.fn(),
          },
        },
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            attachCheckoutSession: jest.fn(),
            markAsPaid: jest.fn(),
            findById: jest.fn(),
            findByCheckoutSessionId: jest.fn(),
          },
        },
        {
          provide: StripeService,
          useValue: { createCheckoutSession: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => undefined) },
        },
      ],
    }).compile();

    service = module.get(CheckoutService);
    cartService = module.get<MockedCartService>(CartService);
    ordersService = module.get<MockedOrdersService>(OrdersService);
    stripeService = module.get<MockedStripeService>(StripeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startCheckout', () => {
    it('snapshots the cart into an order and returns the Stripe checkout url', async () => {
      const cart = buildCart({ items: [buildCartItem()] });
      const order = buildOrder({
        id: 'order-1',
        userId: cart.userId,
        isPaid: false,
      });
      cartService.getCartForCheckout.mockResolvedValue(cart);
      ordersService.createOrder.mockResolvedValue(order);
      stripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_1',
        url: 'https://stripe.test/pay',
      });

      const result = await service.startCheckout(cart.userId);

      expect(ordersService.createOrder).toHaveBeenCalledWith(
        cart.userId,
        cart.items,
      );
      expect(stripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: 'order-1', items: order.items }),
      );
      expect(ordersService.attachCheckoutSession).toHaveBeenCalledWith(
        'order-1',
        'cs_test_1',
      );
      expect(result).toEqual({
        orderId: 'order-1',
        checkoutUrl: 'https://stripe.test/pay',
      });
      expect(cartService.clearCart).not.toHaveBeenCalled();
    });

    it('throws EmptyCartException and creates no order when the cart is empty', async () => {
      cartService.getCartForCheckout.mockResolvedValue(
        buildCart({ items: [] }),
      );

      await expect(service.startCheckout(faker.string.uuid())).rejects.toThrow(
        EmptyCartException,
      );
      expect(ordersService.createOrder).not.toHaveBeenCalled();
      expect(stripeService.createCheckoutSession).not.toHaveBeenCalled();
    });

    it('throws InactiveProductInCartException when the cart holds an inactive product', async () => {
      const inactiveProduct = buildProduct({ isActive: false });
      const item = buildCartItem({
        product: inactiveProduct,
        productId: inactiveProduct.id,
      });
      const cart = buildCart({ items: [item] });
      cartService.getCartForCheckout.mockResolvedValue(cart);

      await expect(service.startCheckout(cart.userId)).rejects.toThrow(
        InactiveProductInCartException,
      );
      expect(ordersService.createOrder).not.toHaveBeenCalled();
    });

    it('throws when Stripe returns no checkout url', async () => {
      const cart = buildCart({ items: [buildCartItem()] });
      cartService.getCartForCheckout.mockResolvedValue(cart);
      ordersService.createOrder.mockResolvedValue(
        buildOrder({ id: 'order-1' }),
      );
      stripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_1',
        url: null,
      });

      await expect(service.startCheckout(cart.userId)).rejects.toThrow();
    });
  });

  describe('handleWebhookEvent', () => {
    it('ignores events other than checkout.session.completed', async () => {
      await service.handleWebhookEvent({
        type: 'payment_intent.created',
        data: { object: {} },
      } as Stripe.Event);

      expect(ordersService.markAsPaid).not.toHaveBeenCalled();
    });

    it('ignores a completed session that is not paid', async () => {
      await service.handleWebhookEvent(
        completedEvent({ id: 'cs_1', payment_status: 'unpaid' }),
      );

      expect(ordersService.markAsPaid).not.toHaveBeenCalled();
    });

    it('marks the order paid and clears the cart, resolving the order from metadata', async () => {
      const order = buildOrder({ id: 'order-1', isPaid: false });
      ordersService.findById.mockResolvedValue(order);
      ordersService.markAsPaid.mockResolvedValue(true);

      await service.handleWebhookEvent(
        completedEvent({
          id: 'cs_1',
          payment_status: 'paid',
          metadata: { orderId: 'order-1' },
        }),
      );

      expect(ordersService.findById).toHaveBeenCalledWith('order-1');
      expect(ordersService.markAsPaid).toHaveBeenCalledWith('order-1');
      expect(cartService.clearCart).toHaveBeenCalledWith(order.userId);
    });

    it('falls back to the session id when the event carries no orderId', async () => {
      const order = buildOrder({ id: 'order-2', isPaid: false });
      ordersService.findByCheckoutSessionId.mockResolvedValue(order);
      ordersService.markAsPaid.mockResolvedValue(true);

      await service.handleWebhookEvent(
        completedEvent({ id: 'cs_2', payment_status: 'paid', metadata: {} }),
      );

      expect(ordersService.findByCheckoutSessionId).toHaveBeenCalledWith(
        'cs_2',
      );
      expect(ordersService.markAsPaid).toHaveBeenCalledWith('order-2');
    });

    it('does not clear the cart when the order was already paid', async () => {
      ordersService.findById.mockResolvedValue(buildOrder({ id: 'order-1' }));
      ordersService.markAsPaid.mockResolvedValue(false);

      await service.handleWebhookEvent(
        completedEvent({
          id: 'cs_1',
          payment_status: 'paid',
          metadata: { orderId: 'order-1' },
        }),
      );

      expect(cartService.clearCart).not.toHaveBeenCalled();
    });

    it('acknowledges quietly when no order matches', async () => {
      ordersService.findById.mockResolvedValue(null);

      await expect(
        service.handleWebhookEvent(
          completedEvent({
            id: 'cs_1',
            payment_status: 'paid',
            metadata: { orderId: 'missing' },
          }),
        ),
      ).resolves.toBeUndefined();
      expect(ordersService.markAsPaid).not.toHaveBeenCalled();
    });
  });
});
