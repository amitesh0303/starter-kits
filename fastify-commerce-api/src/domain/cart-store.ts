export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

class InMemoryCartStore {
  private carts: Map<string, CartItem[]> = new Map();

  getCart(userId: string): Cart {
    return {
      userId,
      items: this.carts.get(userId) || [],
    };
  }

  addItem(userId: string, productId: string, quantity: number): Cart {
    const items = this.carts.get(userId) || [];
    const existing = items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    this.carts.set(userId, items);
    return { userId, items };
  }

  removeItem(userId: string, productId: string): void {
    const items = this.carts.get(userId) || [];
    this.carts.set(
      userId,
      items.filter((item) => item.productId !== productId)
    );
  }

  reset(): void {
    this.carts.clear();
  }
}

let instance: InMemoryCartStore | null = null;

export function getCartStore(): InMemoryCartStore {
  if (!instance) {
    instance = new InMemoryCartStore();
  }
  return instance;
}
