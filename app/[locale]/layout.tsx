import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { locales } from '../config';
import { defaultMetadata } from '../config/metadata';
import { Montserrat } from 'next/font/google';
import '../globals.css';
import { Metadata, Viewport } from 'next';

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
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
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
          <main>
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 