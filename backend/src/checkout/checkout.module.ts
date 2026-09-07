import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { StripeModule } from '../stripe/stripe.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [StripeModule, OrdersModule, CartModule],
  controllers: [CheckoutController, StripeWebhookController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
