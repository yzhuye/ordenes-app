import { PriceCalculator, PricingInput, PricingOutput } from './price-calculator';

export class BasePricing implements PriceCalculator {
  compute(input: PricingInput): PricingOutput {
    const subtotal = input.items.reduce((s, i) => s + i.quantity * i.price, 0);
    return { subtotal, fee: 0, discount: 0, total: subtotal };
  }
}
