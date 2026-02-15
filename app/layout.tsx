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
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OffMind — Great ideas don\'t survive in a crowded mind',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OffMind',
    description: 'The calm productivity system for overthinkers',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1614' },
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
