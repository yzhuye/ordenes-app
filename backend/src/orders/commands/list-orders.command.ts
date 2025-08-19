import { Injectable } from '@nestjs/common';
import { Command } from './command';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ListOrdersCommand implements Command<any> {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const orders = await this.prisma.order.findMany({ 
      where: { isActive: true },
      include: { items: true, discount: true } 
    });

    return orders.map(order => ({
      id: order.id,
      contactName: order.contactName,
      contactEmail: order.contactEmail,
      contactPhone: order.contactPhone,
      country: order.country,
      city: order.city,
      zipCode: order.zipCode,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      subtotal: order.subtotal,
      fee: order.fee,
      totalPrice: order.totalPrice,
      paymentMethod: order.paymentMethod,
      discount: order.discount?.discount,
      itemsCount: order.items.length,
      createdAt: order.createdAt,
    }));
  }
}