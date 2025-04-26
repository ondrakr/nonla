import {getRequestConfig} from 'next-intl/server';
import {locales, Locale} from '../app/config';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    return {
      messages: {},
      locale: locales[0]
    };
  }

  return {
    messages: (await import(`../app/i18n/${locale}.json`)).default,
    locale: locale as Locale
  };
});
 