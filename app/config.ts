// Definice podporovaných jazyků
export const locales = ['cs', 'en', 'de', 'pl'] as const;
export type Locale = typeof locales[number];

// Cesty pro různé jazyky
export const pathnames = {
  '/': '/'
};

export const defaultLocale = 'cs' as const; 