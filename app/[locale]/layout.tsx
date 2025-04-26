import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { locales } from '../config';
import { defaultMetadata } from '../config/metadata';
import { Montserrat } from 'next/font/google';
import '../globals.css';
import { Metadata, Viewport } from 'next';
import CookieConsent from '../components/CookieConsent';
import { CookieConsentProvider } from '../context/CookieConsentContext';

const montserrat = Montserrat({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  ...defaultMetadata,
  icons: {
    icon: [
      { url: '/favicon.svg' },
      { url: '/favicon.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon.svg', sizes: '32x32', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#ff6b00'
      },
    ],
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

type Locale = (typeof locales)[number];

// Pomocná funkce pro načtení zpráv
async function getMessages(locale: string) {
  try {
    return (await import(`../i18n/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>
}) {
  // V Next.js 15 je potřeba použít use() pro získání hodnot z params
  const { locale } = use(params);
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Použití React.use pro načtení zpráv
  const messages = use(getMessages(locale));

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${montserrat.variable} antialiased font-montserrat`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CookieConsentProvider>
            <main>
              {children}
            </main>
            <CookieConsent />
          </CookieConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 