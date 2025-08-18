export type DraftOrder = {
  contactName: string; contactEmail: string; contactPhone: string;
  country: string; city: string; zipCode: string; deliveryAddress: string;
  notes?: string | null;
  paymentMethod: string;
  fee: number; subtotal: number; totalPrice: number;
  discountId?: number | null;
  items: { productId: number; quantity: number; price: number }[];
};

export class OrderPrototype {
  constructor(private readonly base: DraftOrder) {}
  clone(overrides: Partial<DraftOrder> = {}): DraftOrder {
    const items = overrides.items ?? this.base.items.map(i => ({ ...i }));
    return { ...this.base, ...overrides, items };
  }
}
