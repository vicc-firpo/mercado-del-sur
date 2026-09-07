import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-payload.interface';
import { CartService } from './cart.service';
import { CartItemDto } from './dto/cart-item.dto';
import { CartDto } from './dto/cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: AuthUser): Promise<CartDto> {
    return this.cartService.getCart(user.userId);
  }

  @Put('items/:productId')
  addItem(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user: AuthUser,
  ): Promise<CartItemDto> {
    return this.cartService.addItem(user.userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(
    @Param('productId', ParseUUIDPipe) productId: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.cartService.removeItem(user.userId, productId);
  }
}
