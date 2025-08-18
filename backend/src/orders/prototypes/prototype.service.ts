import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderPrototype, DraftOrder } from './order.prototype';

@Injectable()
export class OrderPrototypeService {
  constructor(private readonly prisma: PrismaService) {}

  async buildFromOrder(orderId: number): Promise<OrderPrototype> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const draft: DraftOrder = {
      contactName: order.contactName,
      contactEmail: order.contactEmail,
      contactPhone: order.contactPhone,
      country: order.country,
      city: order.city,
      zipCode: order.zipCode,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes ?? null,
      paymentMethod: order.paymentMethod,
      fee: Number(order.fee),
      subtotal: Number(order.subtotal),
      totalPrice: Number(order.totalPrice),
      discountId: order.discountId ?? null,
      items: order.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        price: Number(i.price),
      })),
    };
    return new OrderPrototype(draft);
  }
}
