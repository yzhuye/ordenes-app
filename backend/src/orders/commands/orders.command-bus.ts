import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PricingFactory } from '../pricing/pricing.factory';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderCommand } from './create-order.command';
import { ListOrdersCommand } from './list-orders.command';
import { GetOrderCommand } from './get-order.command';
import { DeleteOrderCommand } from './delete-order.command';
import { ValidateProductsCommand } from './validate-products.command';
import { ValidateDiscountCommand } from './validate-discount.command';

@Injectable()
export class OrdersCommandBus {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingFactory,
  ) {}

  createOrder(dto: CreateOrderDto) {
    const cmd = new CreateOrderCommand(this.prisma, this.pricing, dto);
    return cmd.execute();
  }

  listOrders() {
    const cmd = new ListOrdersCommand(this.prisma);
    return cmd.execute();
  }

  getOrder(id: number) {
    const cmd = new GetOrderCommand(this.prisma, id);
    return cmd.execute();
  }

  deleteOrder(id: number) {
    const cmd = new DeleteOrderCommand(this.prisma, id);
    return cmd.execute();
  }

  validateProducts(items: { productId: number; quantity: number }[]) {
    const cmd = new ValidateProductsCommand(this.prisma, items);
    return cmd.execute();
  }

  validateDiscount(discountCode?: string) {
    const cmd = new ValidateDiscountCommand(this.prisma, discountCode);
    return cmd.execute();
  }
}
