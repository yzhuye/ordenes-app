import { Injectable, BadRequestException } from '@nestjs/common';
import { Command } from './command';
import { PrismaService } from '@/prisma/prisma.service';
import { PricingInput } from '../pricing/price-calculator';

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

@Injectable()
export class ValidateProductsCommand implements Command<PricingInput> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly items: OrderItemInput[],
  ) {}

  async execute(): Promise<PricingInput> {
    if (!this.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const productIds = this.items.map(item => item.productId);
    
    // Fetch all products in one query
    const products = await this.prisma.product.findMany({
      where: { 
        id: { in: productIds }, 
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        price: true,
        isActive: true
      }
    });

    // Validate all products exist and are active
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      throw new BadRequestException(
        `Products not found or inactive: ${missingIds.join(', ')}`
      );
    }

    // Map items with server-controlled prices
    const validatedItems = this.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price) // Server controls the price
      };
    });

    return {
      items: validatedItems
    };
  }
}
