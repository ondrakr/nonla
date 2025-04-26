import createMiddleware from 'next-intl/middleware';
import { locales } from './app/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Funkce pro kontrolu admin přístupu
function checkAdminAccess(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/admin')) {
    const token = request.cookies.get('auth-token');

    if (!token) {
      // Získáme aktuální locale z URL
      const locale = request.nextUrl.pathname.split('/')[1];
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return null;
}

// Vytvoření middleware pro internacionalizaci
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'cs',
  localePrefix: 'always'
});

// Kombinované middleware
export default async function middleware(request: NextRequest) {
  // Nejprve zkontroluj admin přístup
  const adminCheck = checkAdminAccess(request);
  if (adminCheck) return adminCheck;

  // Pokud není admin redirect, pokračuj s intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
}; 