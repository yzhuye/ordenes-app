import { Injectable, NotFoundException } from '@nestjs/common';
import { Command } from './command';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class GetOrderCommand implements Command<any> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderId: number,
  ) {}

  async execute() {
    const order = await this.prisma.order.findUnique({
      where: { id: this.orderId },
      include: { items: true, discount: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}