import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from '../stripe/stripe.service';
import { CheckoutService } from './checkout.service';

@Controller('stripe')
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly checkoutService: CheckoutService,
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    const event = this.stripeService.constructWebhookEvent(
      req.rawBody as Buffer,
      signature,
    );
    await this.checkoutService.handleWebhookEvent(event);
    return { received: true };
  }
}
