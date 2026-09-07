import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './stripe.constants';
import { StripeService } from './stripe.service';

@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Stripe =>
        new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY')),
    },
    StripeService,
  ],
  exports: [StripeService],
})
export class StripeModule {}
