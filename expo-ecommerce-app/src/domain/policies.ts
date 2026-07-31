import { Cart, CartItem, Product } from "./entities";

/** Maximum items in cart. */
export const MAX_CART_ITEMS = 50;
/** Maximum quantity per item. */
export const MAX_ITEM_QUANTITY = 10;

/** Check if an item can be added to cart. */
export function canAddToCart(cart: Cart, quantity: number = 1): { allowed: boolean; reason?: string } {
  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  if (totalItems + quantity > MAX_CART_ITEMS) return { allowed: false, reason: "Cart item limit reached" };
  return { allowed: true };
}

/** Validate quantity for a cart item. */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_ITEM_QUANTITY;
}

/** Calculate cart subtotal. */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Check if a product is on sale. */
export function isOnSale(product: Product): boolean {
  return product.compareAtPrice !== null && product.compareAtPrice > product.price;
}

/** Calculate discount percentage. */
export function discountPercent(product: Product): number {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100);
}

/** Get available variants for a product. */
export function getAvailableVariants(product: Product): Array<{ id: string; title: string; price: number }> {
  return product.variants.filter(v => v.available).map(v => ({ id: v.id, title: v.title, price: v.price }));
}
