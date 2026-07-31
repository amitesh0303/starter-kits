import { createFakeShopifyAdapter } from "@/adapters/shopify-adapter";
describe("Shopify adapter (fake)", () => {
  it("returns products", async () => { const a = createFakeShopifyAdapter(); const p = await a.getProducts(); expect(p.length).toBeGreaterThan(0); });
  it("gets product by id", async () => { const a = createFakeShopifyAdapter(); const p = await a.getProductById("p1"); expect(p).not.toBeNull(); });
  it("creates and adds to cart", async () => {
    const a = createFakeShopifyAdapter();
    const cart = await a.createCart();
    const updated = await a.addToCart(cart.id, "v1", 2);
    expect(updated.items.length).toBe(1);
    expect(updated.subtotal).toBeGreaterThan(0);
  });
  it("gets checkout url", async () => { const a = createFakeShopifyAdapter(); const url = await a.getCheckoutUrl("cart-1"); expect(url).toContain("checkout"); });
});
