import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programmatic SEO Site",
  description: "Data-generated landing pages optimized for search engines.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
