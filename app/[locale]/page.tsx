import { use } from 'react';
import Hero from '../components/Hero';
import ContactInfo from '../components/ContactInfo';
import Menu from '../components/Menu';
import Footer from '../components/Footer';
import { defaultMetadata } from '../config/metadata';
import { Metadata } from 'next';
import { locales } from '../config';

type Props = {
  params: Promise<{ locale: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  // Vytvoření objektu s alternativními jazyky na základě lokalizací z config
  const languages: Record<string, string> = {};
  locales.forEach(loc => {
    languages[loc] = `/${loc}`;
  });
  
  return {
    ...defaultMetadata,
    metadataBase: new URL(process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'),
    alternates: {
      ...defaultMetadata.alternates,
      languages
    },
    openGraph: {
      ...defaultMetadata.openGraph,
      locale: locale,
      alternateLocale: locales.filter(loc => loc !== locale)
    }
  };
}

export default function Home() {
  return (
    <main>
      <Hero />
      <Menu />
      <ContactInfo />
      <Footer />
    </main>
  );
} 