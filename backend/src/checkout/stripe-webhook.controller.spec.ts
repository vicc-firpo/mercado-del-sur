import { Inject, InjectionToken } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import Stripe from 'stripe';

jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: (entity: InjectionToken) => Inject(entity),
  getRepositoryToken: (entity: InjectionToken) => entity,
}));

import { InvalidWebhookSignatureException } from '../stripe/exceptions/invalid-webhook-signature.exception';
import { StripeService } from '../stripe/stripe.service';
import { CheckoutService } from './checkout.service';
import { StripeWebhookController } from './stripe-webhook.controller';

describe('StripeWebhookController', () => {
  let controller: StripeWebhookController;
  let stripeService: { constructWebhookEvent: jest.Mock };
  let checkoutService: { handleWebhookEvent: jest.Mock };

  const request = (rawBody: Buffer) => ({ rawBody }) as RawBodyRequest<Request>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeWebhookController],
      providers: [
        {
          provide: StripeService,
          useValue: { constructWebhookEvent: jest.fn() },
        },
        {
          provide: CheckoutService,
          useValue: { handleWebhookEvent: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(StripeWebhookController);
    stripeService = module.get(StripeService);
    checkoutService = module.get(CheckoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('verifies the payload and forwards the event to the checkout service', async () => {
    const event = { type: 'checkout.session.completed' } as Stripe.Event;
    stripeService.constructWebhookEvent.mockReturnValue(event);

    const result = await controller.handle(
      request(Buffer.from('{}')),
      'sig_header',
    );

    expect(stripeService.constructWebhookEvent).toHaveBeenCalledWith(
      expect.any(Buffer),
      'sig_header',
    );
    expect(checkoutService.handleWebhookEvent).toHaveBeenCalledWith(event);
    expect(result).toEqual({ received: true });
  });

  it('propagates a signature error and does not process the event', async () => {
    stripeService.constructWebhookEvent.mockImplementation(() => {
      throw new InvalidWebhookSignatureException();
    });

    await expect(
      controller.handle(request(Buffer.from('{}')), 'bad'),
    ).rejects.toThrow(InvalidWebhookSignatureException);
    expect(checkoutService.handleWebhookEvent).not.toHaveBeenCalled();
  });
});
