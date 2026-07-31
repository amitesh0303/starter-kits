import { canAddToCart, isValidQuantity, calculateSubtotal, isOnSale, discountPercent, getAvailableVariants } from "@/domain/policies";
import { Cart, CartItem, Product } from "@/domain/entities";
describe("Cart validation policies", () => {
  const emptyCart: Cart = { id: "c1", items: [], subtotal: 0, currency: "USD", checkoutUrl: null };
  it("allows adding to empty cart", () => { expect(canAddToCart(emptyCart).allowed).toBe(true); });
  it("validates quantity", () => { expect(isValidQuantity(1)).toBe(true); expect(isValidQuantity(0)).toBe(false); expect(isValidQuantity(11)).toBe(false); });
  it("calculates subtotal", () => {
    const items: CartItem[] = [{ variantId: "v1", productId: "p1", title: "A", price: 10, quantity: 2, imageUrl: null }, { variantId: "v2", productId: "p2", title: "B", price: 5, quantity: 1, imageUrl: null }];
    expect(calculateSubtotal(items)).toBe(25);
  });
  it("detects sale items", () => {
    const product: Product = { id: "p1", title: "T", description: "", price: 20, compareAtPrice: 30, currency: "USD", images: [], variants: [], available: true };
    expect(isOnSale(product)).toBe(true);
    expect(isOnSale({ ...product, compareAtPrice: null })).toBe(false);
  });
  it("calculates discount", () => {
    const product: Product = { id: "p1", title: "T", description: "", price: 20, compareAtPrice: 40, currency: "USD", images: [], variants: [], available: true };
    expect(discountPercent(product)).toBe(50);
  });
  it("gets available variants", () => {
    const product: Product = { id: "p1", title: "T", description: "", price: 20, compareAtPrice: null, currency: "USD", images: [], variants: [{ id: "v1", title: "S", available: true, price: 20 }, { id: "v2", title: "M", available: false, price: 20 }], available: true };
    expect(getAvailableVariants(product)).toHaveLength(1);
  });
});
