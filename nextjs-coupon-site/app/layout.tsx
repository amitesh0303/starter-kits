import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coupon Site",
  description: "Find the best deals, coupons, and promo codes for your favorite stores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
