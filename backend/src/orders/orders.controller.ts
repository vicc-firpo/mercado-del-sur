import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt-payload.interface';
import { OrderDetailDto } from './dto/order-detail.dto';
import { OrderSummaryDto } from './dto/order-summary.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findMyOrders(@CurrentUser() user: AuthUser): Promise<OrderSummaryDto[]> {
    return this.ordersService.findMyOrders(user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<OrderDetailDto> {
    return this.ordersService.findMyOrderDetail(user.userId, id);
  }
}
