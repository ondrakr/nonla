'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCookieConsent } from '../context/CookieConsentContext';

const CookieConsent = () => {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const { cookieConsent, setCookieConsent } = useCookieConsent();

  useEffect(() => {
    // Zobrazit banner pouze pokud uživatel ještě neudělil souhlas
    if (cookieConsent === null) {
      // Zobrazit banner až po načtení stránky s malým zpožděním
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [cookieConsent]);

  const acceptAllCookies = () => {
    setCookieConsent('all');
    setIsVisible(false);
  };

  const acceptNecessaryCookies = () => {
    setCookieConsent('necessary');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-orange p-4 md:p-6">
      <div className="max-w-[min(1400px,100%)] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <Image 
              src="/cookie.svg" 
              alt="Cookies" 
              width={28} 
              height={28}
              className="hidden md:block"
            />
            <h3 className="text-lg md:text-xl text-orange">{t('cookies.title')}</h3>
          </div>
          
          <p className="text-white text-sm md:text-base flex-1">
            {t('cookies.description')}
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <button
              onClick={acceptNecessaryCookies}
              className="px-4 py-2 border border-orange text-orange text-sm rounded-md hover:bg-orange hover:text-black transition-colors flex-1 md:flex-auto"
            >
              {t('cookies.necessary')}
            </button>
            <button
              onClick={acceptAllCookies}
              className="px-4 py-2 bg-orange text-black text-sm rounded-md hover:bg-[#e89418] transition-colors flex-1 md:flex-auto"
            >
              {t('cookies.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 