export type DraftOrder = {
  contactName: string; contactEmail: string; contactPhone: string;
  country: string; city: string; zipCode: string; deliveryAddress: string;
  notes?: string | null;
  paymentMethod: string;
  fee: number; subtotal: number; totalPrice: number;
  discountCode?: string | null;
  items: { productId: number; quantity: number; price: number }[];
};

/**
 * This prototype class allows customers to easily reorder previous orders 
 * with optional modifications.
 */
export class OrderPrototype {
  constructor(private readonly base: DraftOrder) {}
  
  /**
   *  The method creates a copy of the order with optional modifications.
   *  It's perfect for reorder scenarios where customers want to change delivery address,
   *  modify quantities, add/remove items, or update contact info.
   */
  clone(overrides: Partial<DraftOrder> = {}): DraftOrder {
    const items = overrides.items ?? this.base.items.map(i => ({ ...i }));
    return { ...this.base, ...overrides, items };
  }
}
