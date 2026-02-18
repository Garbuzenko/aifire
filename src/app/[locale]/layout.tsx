import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Footer from "../components/Footer";
import Header from "../components/Header";
import YandexMetrika from "../components/YandexMetrika";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'Index'});
 
  return {
    title: t('meta_title'),
    description: t('meta_description')
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <YandexMetrika />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <div className="flex-grow pt-16">
            {children}
          </div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
