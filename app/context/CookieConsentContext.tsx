'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CookieConsentType = 'all' | 'necessary' | null;

interface CookieConsentContextType {
  cookieConsent: CookieConsentType;
  setCookieConsent: (consent: CookieConsentType) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [cookieConsent, setCookieConsent] = useState<CookieConsentType>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Načtení stavu souhlasu z localStorage při inicializaci
    try {
      const storedConsent = localStorage.getItem('cookiesAccepted');
      if (storedConsent === 'true') {
        setCookieConsent('all');
      } else if (storedConsent === 'necessary') {
        setCookieConsent('necessary');
      } else {
        setCookieConsent(null);
      }
    } catch (error) {
      console.error('Chyba při načítání stavu cookies:', error);
      setCookieConsent(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Uložení změn do localStorage
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (cookieConsent === 'all') {
        localStorage.setItem('cookiesAccepted', 'true');
      } else if (cookieConsent === 'necessary') {
        localStorage.setItem('cookiesAccepted', 'necessary');
      } else if (cookieConsent === null) {
        localStorage.removeItem('cookiesAccepted');
      }
    } catch (error) {
      console.error('Chyba při ukládání stavu cookies:', error);
    }
  }, [cookieConsent, isInitialized]);

  return (
    <CookieConsentContext.Provider value={{ cookieConsent, setCookieConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
} 