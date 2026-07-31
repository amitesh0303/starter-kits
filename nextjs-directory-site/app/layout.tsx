import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Directory Site",
  description: "Find businesses, tools, and places in our comprehensive directory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
