import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import fs from 'fs';
import path from 'path';

function logDebug(message: string) {
  const logDir = path.join(process.cwd(), 'temp', 'errors');
  const logPath = path.join(logDir, 'i18n_debug.log');
  const timestamp = new Date().toISOString();
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (e) {
    // ignore
  }
}
 
import { locales } from './locales';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  
  // logDebug(`i18n requestLocale: ${locale}`);

  if (!locale || !locales.includes(locale)) {
    logDebug(`i18n notFound for locale: ${locale}`);
    notFound();
  }

  try {
      const messages = (await import(`../messages/${locale}.json`)).default;
      return {
        locale,
        messages
      };
  } catch (error) {
      logDebug(`i18n failed to load messages for ${locale}: ${error}`);
      throw error;
  }
});
