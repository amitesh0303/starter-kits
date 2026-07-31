import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "File Conversion SaaS Starter",
  description:
    "File conversion, storage, and media processing with quota-gated uploads and bounded-retry conversion jobs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
