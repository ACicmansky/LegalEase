import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Anek_Bangla } from 'next/font/google';
import PlausibleProvider from 'next-plausible';

const anek = Anek_Bangla({
  subsets: ['latin'],
  display: 'swap',
});

let title = 'AI legal assistant';
let description = 'Get answers to your legal questions in seconds';
let ogimage = 'https://www.pdftochat.com/og-image.png';
let url = 'https://www.legalease.sk';
let sitename = 'legalease.sk';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={anek.className}>
        <head>
          <PlausibleProvider domain="legalease.sk" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
