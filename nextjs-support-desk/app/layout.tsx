import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Desk - Help & Ticketing",
  description:
    "Customer support ticketing system with team management, file attachments, and email notifications.",
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
