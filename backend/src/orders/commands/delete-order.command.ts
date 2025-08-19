import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Command } from './command';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DeleteOrderCommand implements Command<{ success: boolean; message: string }> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderId: number,
  ) {}

  async execute(): Promise<{ success: boolean; message: string }> {
    const existingOrder = await this.prisma.order.findUnique({
      where: { id: this.orderId },
      select: {
        id: true,
        isActive: true,
        contactName: true,
        createdAt: true
      }
    });

    if (!existingOrder) {
      throw new NotFoundException(`Order with ID ${this.orderId} not found`);
    }

    if (!existingOrder.isActive) {
      throw new BadRequestException(`Order ${this.orderId} is already deleted`);
    }

    await this.prisma.order.update({
      where: { id: this.orderId },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return {
      success: true,
      message: `Order ${this.orderId} has been successfully deleted`
    };
  }
}
