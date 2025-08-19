import { PriceCalculator, PricingInput, PricingOutput } from './price-calculator';

export class DiscountDecorator implements PriceCalculator {
  constructor(private readonly inner: PriceCalculator) {}

  compute(input: PricingInput): PricingOutput {
    const base = this.inner.compute(input);
    const discount = input.discountAmount ?? 0;
    const subtotalAfterDiscount = Math.max(0, base.subtotal - discount);
    return { 
      ...base, 
      discount, 
      total: subtotalAfterDiscount + base.fee 
    };
  }
}
