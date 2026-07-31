import { isValidListing, canPurchase, calculateSellerRating, isValidRating } from "@/domain/policies";
import { Listing, Review } from "@/domain/entities";
describe("Listing validation", () => {
  it("valid listing", () => { expect(isValidListing({ title: "Item", price: 10 }).valid).toBe(true); });
  it("missing title", () => { expect(isValidListing({ title: "", price: 10 }).valid).toBe(false); });
  it("invalid price", () => { expect(isValidListing({ title: "X", price: -1 }).valid).toBe(false); });
  it("title too long", () => { expect(isValidListing({ title: "a".repeat(101), price: 10 }).valid).toBe(false); });
});
describe("Purchase rules", () => {
  const listing: Listing = { id: "l1", sellerId: "s1", title: "T", description: "", price: 10, currency: "USD", category: "stuff", location: null, imageUrls: [], status: "active", createdAt: "" };
  it("allows purchase of active listing", () => { expect(canPurchase(listing, "b1")).toBe(true); });
  it("blocks self-purchase", () => { expect(canPurchase(listing, "s1")).toBe(false); });
  it("blocks purchase of sold listing", () => { expect(canPurchase({ ...listing, status: "sold" }, "b1")).toBe(false); });
});
describe("Seller rating", () => {
  it("calculates average", () => {
    const reviews: Review[] = [{ id: "r1", orderId: "o1", reviewerId: "u1", sellerId: "s1", rating: 4, comment: "", createdAt: "" }, { id: "r2", orderId: "o2", reviewerId: "u2", sellerId: "s1", rating: 5, comment: "", createdAt: "" }];
    expect(calculateSellerRating(reviews)).toBe(4.5);
  });
  it("returns 0 for no reviews", () => { expect(calculateSellerRating([])).toBe(0); });
  it("validates rating range", () => { expect(isValidRating(3)).toBe(true); expect(isValidRating(0)).toBe(false); expect(isValidRating(6)).toBe(false); });
});
