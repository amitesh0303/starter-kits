import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LMS SaaS Starter",
  description:
    "Learning management system with courses, memberships, and video streaming",
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
