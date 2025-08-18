import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingFactory } from '../pricing/pricing.factory';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderCommand } from './create-order.command';

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
}
