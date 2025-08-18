import { Injectable } from '@nestjs/common';
import { PriceCalculator } from './price-calculator';
import { BasePricing } from './base.pricing';
import { FeeDecorator } from './fee.decorator';
import { DiscountDecorator } from './discount.decorator';

@Injectable()
export class PricingFactory {
  build({ hasFee, hasDiscount }: { hasFee: boolean; hasDiscount: boolean }): PriceCalculator {
    let calc: PriceCalculator = new BasePricing();
    if (hasFee) calc = new FeeDecorator(calc);
    if (hasDiscount) calc = new DiscountDecorator(calc);
    return calc;
  }
}
