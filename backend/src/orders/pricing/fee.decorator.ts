import { PriceCalculator, PricingInput, PricingOutput } from './price-calculator';

export class FeeDecorator implements PriceCalculator {
  constructor(private readonly inner: PriceCalculator) {}
  compute(input: PricingInput): PricingOutput {
    const base = this.inner.compute(input);
    const fee = input.fee ?? 0;
    return { ...base, fee, total: base.total + fee };
  }
}
