import crypto from "node:crypto";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

class InMemoryProductStore {
  private products: Map<string, Product> = new Map();

  list(): Product[] {
    return Array.from(this.products.values());
  }

  getById(id: string): Product | undefined {
    return this.products.get(id);
  }

  create(data: { name: string; price: number; description?: string }): Product {
    const product: Product = {
      id: crypto.randomUUID(),
      name: data.name,
      price: data.price,
      description: data.description || "",
    };
    this.products.set(product.id, product);
    return product;
  }

  reset(): void {
    this.products.clear();
  }
}

let instance: InMemoryProductStore | null = null;

export function getProductStore(): InMemoryProductStore {
  if (!instance) {
    instance = new InMemoryProductStore();
  }
  return instance;
}
