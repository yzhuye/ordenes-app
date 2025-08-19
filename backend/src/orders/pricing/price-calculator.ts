export type PricingInput = {
  items: { productId: number; quantity: number; price: number }[];
  fee?: number;
  discountAmount?: number;
};

export type PricingOutput = {
  subtotal: number;
  fee: number;
  discount: number;
  total: number;
};

export interface PriceCalculator {
  compute(input: PricingInput): PricingOutput;
}
