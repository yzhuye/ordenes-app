import { Command } from './command';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingFactory } from '../pricing/pricing.factory';
import { CreateOrderDto } from '../dto/create-order.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateOrderCommand implements Command<any> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingFactory: PricingFactory,
    private readonly dto: CreateOrderDto,
  ) {}

  async execute() {
    // reglas de pricing via Decorator
    const calc = this.pricingFactory.build({
      hasFee: !!this.dto.fee,
      hasDiscount: !!this.dto.discountId && !!this.dto.discountAmount,
    });
    const p = calc.compute({
      items: this.dto.items,
      fee: this.dto.fee ?? 0,
      discountAmount: this.dto.discountAmount ?? 0,
    });

    // (opcional) valida que el discount exista y esté activo
    if (this.dto.discountId) {
      const d = await this.prisma.discount.findUnique({ where: { id: this.dto.discountId } });
      if (!d || !d.isActive) throw new Error('Invalid discount');
    }

    // transacción de creación
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          contactName: this.dto.contactName,
          contactEmail: this.dto.contactEmail,
          contactPhone: this.dto.contactPhone,
          country: this.dto.country,
          city: this.dto.city,
          zipCode: this.dto.zipCode,
          deliveryAddress: this.dto.deliveryAddress,
          notes: this.dto.notes ?? null,
          paymentMethod: this.dto.paymentMethod,
          fee: p.fee,
          subtotal: p.subtotal,
          totalPrice: p.total,
          discountId: this.dto.discountId ?? null,
          items: {
            create: this.dto.items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price,
            })),
          },
        },
        include: { items: true, discount: true },
      });
      return order;
    });
  }
}
