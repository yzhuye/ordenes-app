import { Command } from './command';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingFactory } from '../pricing/pricing.factory';
import { CreateOrderDto } from '../dto/create-order.dto';
import { ValidateProductsCommand } from './validate-products.command';
import { ValidateDiscountCommand } from './validate-discount.command';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateOrderCommand implements Command<any> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingFactory: PricingFactory,
    private readonly dto: CreateOrderDto,
  ) {}

  async execute() {
    // Step 1: Validate products and get server-controlled prices
    const validateProductsCmd = new ValidateProductsCommand(
      this.prisma, 
      this.dto.items
    );
    const validatedItems = await validateProductsCmd.execute();

    // Step 2: Validate discount code if provided
    const validateDiscountCmd = new ValidateDiscountCommand(
      this.prisma, 
      this.dto.discountCode
    );
    const validatedDiscount = await validateDiscountCmd.execute();

    // Step 3: Calculate delivery fee (business logic - could be more complex)
    const deliveryFee = this.calculateDeliveryFee();

    // Step 4: Build pricing calculator with proper decorators
    const calc = this.pricingFactory.build({
      hasFee: deliveryFee > 0,
      hasDiscount: !!validatedDiscount,
    });

    // Step 5: Calculate subtotal first for percentage-based discounts
    const subtotal = validatedItems.items.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );

    // Calculate actual discount amount (percentage * subtotal)
    const discountAmount = validatedDiscount 
      ? subtotal * validatedDiscount.amount  // 0.1 * 418000 = 41800
      : 0;

    // Step 6: Compute final pricing with calculated discount amount
    const pricing = calc.compute({
      items: validatedItems.items,
      fee: deliveryFee,
      discountAmount: discountAmount,
    });

    // Step 7: Create order in transaction
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
          fee: pricing.fee,
          subtotal: pricing.subtotal,
          totalPrice: pricing.total,
          discountId: validatedDiscount?.id ?? null,
          items: {
            create: validatedItems.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price, // Server-controlled price
            })),
          },
        },
        include: { items: true, discount: true },
      });
      return order;
    });
  }

  private calculateDeliveryFee(): number {
    return 24000;
  }
}
