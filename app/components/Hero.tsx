'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const changeLanguage = (newLocale: string) => {
    router.push(`/${newLocale}`);
    setIsLanguageOpen(false);
  };

  const getFlagImage = (locale: string) => {
    switch (locale) {
      case 'cs':
        return '/czech.png';
      case 'en':
        return '/britanie.png';
      case 'de':
        return '/nemecko.png';
      case 'pl':
        return '/polsko.png';
      default:
        return '/czech.png';
    }
  };

  const getAvailableLanguages = () => {
    const allLanguages = ['cs', 'en', 'de', 'pl'];
    return allLanguages.filter(lang => lang !== locale);
  };

  // Zavře menu jazyků při změně velikosti okna
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isLanguageOpen) {
        setIsLanguageOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLanguageOpen]);

  return (
    <section className="relative h-screen flex flex-col bg-black">
      {/* Header část */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between md:justify-end items-start md:items-center px-4 md:px-8 py-6">
        {/* Mobilní kontakty vlevo */}
        <div className="md:hidden flex flex-col gap-3">
          <a 
            href={`tel:${t('phone')}`} 
            className="flex items-center gap-2 hover:text-orange transition text-white"
          >
            <Image
              src="/Phone_icon.svg"
              alt="Telefon"
              width={24}
              height={24}
            />
            <p className="text-sm">{t('phone')}</p>
          </a>
          <a 
            href="https://maps.app.goo.gl/r6Er6sZq91nrd4V39"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-orange transition text-white"
          >
            <Image
              src="/Place_icon.svg"
              alt="Lokace"
              width={24}
              height={24}
            />
            <p className="text-sm">{t('location')}</p>
          </a>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-8 lg:gap-12 text-white pr-6 lg:pr-12">
          <a href={`tel:${t('phone')}`} className="flex items-center gap-2 hover:text-orange transition">
            <Image
              src="/Phone_icon.svg"
              alt="Telefon"
              width={40}
              height={40}
            />
            <p className="text-lg lg:text-xl">{t('phone')}</p>
          </a>
          <div className="flex items-center gap-2">
            <Image
              src="/Place_icon.svg"
              alt="Lokace"
              width={40}
              height={40}
            />
            <a 
              href="https://maps.app.goo.gl/r6Er6sZq91nrd4V39"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg lg:text-xl hover:text-orange transition"
            >
              {t('location')}
            </a>
          </div>
          <div className="relative">
            <div 
              className="flex items-center gap-2 hover:text-orange transition cursor-pointer"
              onMouseEnter={() => setIsLanguageOpen(true)}
              onMouseLeave={() => setIsLanguageOpen(false)}
            >
              <Image
                src={getFlagImage(locale)}
                alt="Current language"
                width={24}
                height={24}
                className="w-6 h-auto"
              />
              <Image
                src="/arrow_white.svg"
                alt="Rozbalit jazyky"
                width={16}
                height={16}
                className={`transition-transform w-4 h-4 ${isLanguageOpen ? 'rotate-180' : ''}`}
              />
              {isLanguageOpen && (
                <div className="absolute top-[100%] bg-black/90 rounded-md py-2 w-[40px]">
                  {getAvailableLanguages().map((lang) => (
                    <div
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className="flex items-center justify-center px-2 py-2 hover:bg-white/10 transition w-full cursor-pointer"
                    >
                      <Image
                        src={getFlagImage(lang)}
                        alt={lang}
                        width={24}
                        height={24}
                        className="w-6 h-auto"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobilní jazyk vpravo */}
        <div className="md:hidden relative">
          <div 
            className="flex items-center gap-1 text-white cursor-pointer"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
          >
            <Image
              src={getFlagImage(locale)}
              alt="Current language"
              width={24}
              height={24}
              className="w-6 h-auto"
            />
            <Image
              src="/arrow_white.svg"
              alt="Rozbalit jazyky"
              width={16}
              height={16}
              className={`transition-transform w-4 h-4 ${isLanguageOpen ? 'rotate-180' : ''}`}
            />
          </div>
          
          {isLanguageOpen && (
            <div className="absolute top-[100%] right-0 mt-2 bg-black/90 rounded-md p-2">
              <div className="flex flex-col gap-2">
                {getAvailableLanguages().map((lang) => (
                  <div
                    key={lang}
                    onClick={() => changeLanguage(lang)}
                    className="flex items-center gap-2 hover:bg-white/10 p-2 transition cursor-pointer"
                  >
                    <Image
                      src={getFlagImage(lang)}
                      alt={lang}
                      width={24}
                      height={24}
                      className="w-6 h-auto"
                    />
                    <span className="text-white text-sm uppercase">{lang}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pozadí */}
      <div className="absolute inset-0">
        <Image
          src="/header_img.jpg"
          alt="Restaurant interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" 
          style={{
            background: `
              linear-gradient(180deg, rgba(0, 0, 0, 0.00) 80.84%, #000 100%),
              linear-gradient(276deg, rgba(0, 0, 0, 0.00) 3.83%, #000 95.25%)
            `
          }} 
        />
      </div>

      {/* Hlavní obsah */}
      <div className="relative flex-1 flex flex-col items-center md:items-start justify-center md:justify-start text-white px-4 md:pl-24 md:pt-24">  
        <Image
          src="/logo_white.svg"
          alt="Nón Lá logo"
          width={600}
          height={600}
          className="w-full max-w-[300px] md:max-w-[500px] lg:max-w-[600px] h-auto"
        />
      </div>

      {/* Šipky dolů */}
      <div className="relative flex flex-col items-center mb-8 md:mb-12">
        <Image
          src="/arrow.svg"
          alt="Scroll down"
          width={40}
          height={40}
          className="animate-bounce"
        />
        <Image
          src="/arrow.svg"
          alt="Scroll down"
          width={40}
          height={40}
          className="animate-bounce [animation-delay:300ms] mt-[-1.3rem]"
        />
      </div>
    </section>
  );
};

export default Hero; 