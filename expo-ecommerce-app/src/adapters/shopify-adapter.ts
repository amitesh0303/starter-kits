import { Product, Cart } from "../domain/entities";
export interface ShopifyAdapter {
  getProducts(query?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createCart(): Promise<Cart>;
  addToCart(cartId: string, variantId: string, quantity: number): Promise<Cart>;
  getCheckoutUrl(cartId: string): Promise<string>;
}
export function createFakeShopifyAdapter(): ShopifyAdapter {
  const fakeProduct: Product = { id: "p1", title: "Sample Product", description: "A great product", price: 29.99, compareAtPrice: 39.99, currency: "USD", images: [], variants: [{ id: "v1", title: "Default", available: true, price: 29.99 }], available: true };
  let cart: Cart = { id: "cart-1", items: [], subtotal: 0, currency: "USD", checkoutUrl: null };
  return {
    async getProducts(_q) { return [fakeProduct]; },
    async getProductById(_id) { return fakeProduct; },
    async createCart() { cart = { id: "cart-" + Date.now(), items: [], subtotal: 0, currency: "USD", checkoutUrl: null }; return cart; },
    async addToCart(_cartId, _variantId, quantity) { cart.items.push({ variantId: "v1", productId: "p1", title: "Sample", price: 29.99, quantity, imageUrl: null }); cart.subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0); return cart; },
    async getCheckoutUrl(_cartId) { return "https://shop.example.com/checkout"; },
  };
}
