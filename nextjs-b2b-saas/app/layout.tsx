import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B SaaS - Organizations, Teams & RBAC",
  description:
    "Multi-tenant B2B SaaS with organization management, team roles, and subscription billing.",
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
