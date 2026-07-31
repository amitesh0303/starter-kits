import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Board",
  description: "Find your next career opportunity in our job directory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
