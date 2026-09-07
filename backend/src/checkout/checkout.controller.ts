import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-payload.interface';
import { CheckoutService } from './checkout.service';
import { CheckoutSessionDto } from './dto/checkout-session.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  startCheckout(@CurrentUser() user: AuthUser): Promise<CheckoutSessionDto> {
    return this.checkoutService.startCheckout(user.userId);
  }
}
