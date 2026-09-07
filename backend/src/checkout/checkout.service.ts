import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CartService } from '../cart/cart.service';
import { EmptyCartException } from '../cart/exceptions/empty-cart.exception';
import { OrdersService } from '../orders/orders.service';
import { StripeService } from '../stripe/stripe.service';
import { CheckoutSessionDto } from './dto/checkout-session.dto';

@Injectable()
export class CheckoutService {
  private readonly successUrl: string;
  private readonly cancelUrl: string;

  constructor(
    private readonly cartService: CartService,
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
    config: ConfigService,
  ) {
    const frontendUrl =
      config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    this.successUrl =
      config.get<string>('CHECKOUT_SUCCESS_URL') ??
      `${frontendUrl}/checkout/success`;
    this.cancelUrl =
      config.get<string>('CHECKOUT_CANCEL_URL') ??
      `${frontendUrl}/checkout/cancel`;
  }

  async startCheckout(userId: string): Promise<CheckoutSessionDto> {
    const cart = await this.cartService.getCartForCheckout(userId);
    if (!cart.items?.length) {
      throw new EmptyCartException();
    }

    const order = await this.ordersService.createOrder(userId, cart.items);
    const session = await this.stripeService.createCheckoutSession({
      orderId: order.id,
      items: order.items,
      successUrl: this.successUrl,
      cancelUrl: this.cancelUrl,
    });
    await this.ordersService.attachCheckoutSession(order.id, session.id);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }
    return { orderId: order.id, checkoutUrl: session.url };
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    if (event.type !== 'checkout.session.completed') {
      return;
    }

    const session = event.data.object;
    if (session.payment_status !== 'paid') {
      return;
    }

    const orderId =
      session.metadata?.orderId ?? session.client_reference_id ?? null;
    const order = orderId
      ? await this.ordersService.findById(orderId)
      : await this.ordersService.findByCheckoutSessionId(session.id);
    if (!order) {
      return;
    }

    const newlyPaid = await this.ordersService.markAsPaid(order.id);
    if (newlyPaid) {
      await this.cartService.clearCart(order.userId);
    }
  }
}
