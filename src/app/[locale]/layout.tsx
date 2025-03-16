import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import type { Metadata } from "next";
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  // Use params to potentially customize metadata based on locale in the future
  const locale = params.locale;
  return {
    title: "Legal Document Chat",
    description: `Chat with your legal documents using AI (${locale})`,
  };
}

interface RootLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: RootLayoutProps) {
  const { locale } = await params;
  
  // Validate that the locale is supported
  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }
  
  // Get messages for client components
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    // Fallback to empty messages object to prevent errors
    messages = {};
  }
  
  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
              </div>
              {children}
            </div>
            <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
