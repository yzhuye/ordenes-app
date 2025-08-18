import { PriceCalculator } from './price-calculator';

export class DiscountDecorator implements PriceCalculator {
  constructor(private readonly inner: PriceCalculator) {}
  compute(input) {
    const base = this.inner.compute(input);
    const discount = input.discountAmount ?? 0;
    return { ...base, discount, total: base.total - discount };
  }
}
