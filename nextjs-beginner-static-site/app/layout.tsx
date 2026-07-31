import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SiteConfig } from '@/config';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: SiteConfig.siteName,
    template: `%s | ${SiteConfig.siteName}`,
  },
  description: SiteConfig.description,
  metadataBase: new URL(SiteConfig.siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SiteConfig.siteName,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
