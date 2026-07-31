import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Tools",
  description: "Free calculators, generators, and utilities for everyday tasks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
