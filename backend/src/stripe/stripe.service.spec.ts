import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { buildOrderItem } from '../test/factories/order-item.factory';
import { InvalidWebhookSignatureException } from './exceptions/invalid-webhook-signature.exception';
import { STRIPE_CLIENT } from './stripe.constants';
import { StripeService } from './stripe.service';

type MockedStripe = {
  checkout: { sessions: { create: jest.Mock } };
  webhooks: { constructEvent: jest.Mock };
};

describe('StripeService', () => {
  let service: StripeService;
  let stripe: MockedStripe;

  beforeEach(async () => {
    stripe = {
      checkout: { sessions: { create: jest.fn() } },
      webhooks: { constructEvent: jest.fn() },
    };

    const config = {
      get: jest.fn((key: string) =>
        key === 'STRIPE_CURRENCY' ? 'uyu' : undefined,
      ),
      getOrThrow: jest.fn(() => 'whsec_test'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: STRIPE_CLIENT, useValue: stripe },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(StripeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('maps order items to line items in the currency minor unit', async () => {
      const session = { id: 'cs_test_1', url: 'https://stripe.test/pay' };
      stripe.checkout.sessions.create.mockResolvedValue(session);

      const result = await service.createCheckoutSession({
        orderId: 'order-1',
        items: [
          buildOrderItem({
            productName: 'Silla',
            productDescription: 'Roble',
            unitPrice: '19.99',
            quantity: 2,
          }),
          buildOrderItem({
            productName: 'Mesa',
            productDescription: null,
            unitPrice: '100.00',
            quantity: 1,
          }),
        ],
        successUrl: 'https://app.test/ok',
        cancelUrl: 'https://app.test/cancel',
      });

      expect(result).toBe(session);
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          success_url: 'https://app.test/ok',
          cancel_url: 'https://app.test/cancel',
          client_reference_id: 'order-1',
          metadata: { orderId: 'order-1' },
          line_items: [
            {
              quantity: 2,
              price_data: {
                currency: 'uyu',
                unit_amount: 1999,
                product_data: { name: 'Silla', description: 'Roble' },
              },
            },
            {
              quantity: 1,
              price_data: {
                currency: 'uyu',
                unit_amount: 10000,
                product_data: { name: 'Mesa' },
              },
            },
          ],
        }),
      );
    });
  });

  describe('constructWebhookEvent', () => {
    it('returns the verified event', () => {
      const event = { id: 'evt_1', type: 'checkout.session.completed' };
      stripe.webhooks.constructEvent.mockReturnValue(event);

      const result = service.constructWebhookEvent(
        Buffer.from('{}'),
        'sig_header',
      );

      expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
        expect.any(Buffer),
        'sig_header',
        'whsec_test',
      );
      expect(result).toBe(event);
    });

    it('throws InvalidWebhookSignatureException when verification fails', () => {
      stripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('bad signature');
      });

      expect(() =>
        service.constructWebhookEvent(Buffer.from('{}'), 'bad'),
      ).toThrow(InvalidWebhookSignatureException);
    });
  });
});
