import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
const locales = ['en', 'ru', 'es', 'de', 'fr', 'zh', 'ja'];
 
export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  
  console.log('i18n requestLocale:', locale);

  if (!locale || !locales.includes(locale)) {
    console.log('i18n notFound for locale:', locale);
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
