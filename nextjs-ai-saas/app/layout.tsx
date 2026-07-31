import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI SaaS - Chat and Content Generation",
  description: "AI-powered chat and content generation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // When no valid Clerk key is available (placeholder/missing), render without ClerkProvider
  if (
    !publishableKey ||
    publishableKey.includes("placeholder") ||
    publishableKey === "your-value-here"
  ) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
