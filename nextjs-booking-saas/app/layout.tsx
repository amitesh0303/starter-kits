import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking SaaS - Appointments & Reservations",
  description:
    "Online appointment scheduling with calendar integration, payment processing, and automated notifications.",
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
