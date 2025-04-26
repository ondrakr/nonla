export type Locale = 'cs' | 'en' | 'de';

export const defaultLocale: Locale = 'cs';
export const locales: Locale[] = ['cs', 'en', 'de'];

export function getMessages(locale: Locale) {
  return import(`./${locale}.json`).then((module) => module.default);
} 