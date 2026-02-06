import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'OffMind',
    template: '%s | OffMind',
  },
  description: 'The calm productivity system for overthinkers',
  keywords: ['productivity', 'gtd', 'task management', 'notes', 'ai'],
  authors: [{ name: 'Paulo' }],
  creator: 'Paulo',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'OffMind',
    title: 'OffMind',
    description: 'The calm productivity system for overthinkers',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OffMind',
    description: 'The calm productivity system for overthinkers',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf8' },
    { media: '(prefers-color-scheme: dark)', color: '#08080c' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
