import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
const locales = [
  'ar', 'az', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'it', 'ja', 'ka', 'kk', 'ko', 'ky', 'lt', 'lv', 'mn', 'ms', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'tg', 'th', 'tk', 'tr', 'uk', 'uz', 'vi', 'zh-CN', 'zh'
];
 
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
