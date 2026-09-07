import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrderItem } from '../orders/entities/order-item.entity';
import { InvalidWebhookSignatureException } from './exceptions/invalid-webhook-signature.exception';
import { STRIPE_CLIENT } from './stripe.constants';

export interface CreateCheckoutSessionParams {
  orderId: string;
  items: OrderItem[];
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class StripeService {
  private readonly currency: string;
  private readonly webhookSecret: string;

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    config: ConfigService,
  ) {
    this.currency = config.get<string>('STRIPE_CURRENCY') ?? 'uyu';
    this.webhookSecret = config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
  }

  createCheckoutSession(
    params: CreateCheckoutSessionParams,
  ): Promise<Stripe.Checkout.Session> {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      params.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: this.currency,
          unit_amount: Math.round(Number(item.unitPrice) * 100),
          product_data: {
            name: item.productName,
            ...(item.productDescription
              ? { description: item.productDescription }
              : {}),
          },
        },
      }));

    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.orderId,
      metadata: { orderId: params.orderId },
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch {
      throw new InvalidWebhookSignatureException();
    }
  }
}
