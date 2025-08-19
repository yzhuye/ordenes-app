import { Injectable, BadRequestException } from '@nestjs/common';
import { Command } from './command';
import { PrismaService } from '@/prisma/prisma.service';

export interface ValidatedDiscount {
  id: number;
  code: string;
  amount: number; // Percentage value (0.1 = 10%)
  isValid: boolean;
}

@Injectable()
export class ValidateDiscountCommand implements Command<ValidatedDiscount | null> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discountCode?: string,
  ) {}

  async execute(): Promise<ValidatedDiscount | null> {
    if (!this.discountCode) {
      return null;
    }

    const discount = await this.prisma.discount.findUnique({
      where: { code: this.discountCode },
      select: {
        id: true,
        code: true,
        discount: true,
        validUntil: true,
        isActive: true
      }
    });

    if (!discount) {
      throw new BadRequestException(`Discount code '${this.discountCode}' not found`);
    }

    if (!discount.isActive) {
      throw new BadRequestException(`Discount code '${this.discountCode}' is not active`);
    }

    if (discount.validUntil) {
      const expirationDate = new Date(discount.validUntil);
      expirationDate.setHours(23, 59, 59, 999);
      
      const now = new Date();
      
      if (now > expirationDate) {
        throw new BadRequestException(`Discount code '${this.discountCode}' has expired`);
      }
    }

    return {
      id: discount.id,
      code: discount.code,
      amount: Number(discount.discount), // Percentage (0.1 = 10%)
      isValid: true
    };
  }
}
