import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({ include: { items: true, discount: true } });
  }

  async findOneOrThrow(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, discount: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
