import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automation SaaS Starter",
  description:
    "Workflow automation with scheduled/webhook/manual triggers, bounded retries, and Stripe billing",
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
