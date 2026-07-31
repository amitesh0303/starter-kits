import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate Directory",
  description: "Find properties for sale and rent in your area.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
