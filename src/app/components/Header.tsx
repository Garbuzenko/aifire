'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('Footer');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black backdrop-blur-none">
      <div className="flex items-center gap-4">
        <a 
          href="https://ai-fire.ru/ru" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:opacity-80 transition-opacity flex items-center"
        >
          <img 
            alt="AI Founders" 
            loading="lazy" 
            width="28" 
            height="28" 
            decoding="async" 
            data-nimg="1" 
            className="h-7 md:h-8 w-auto" 
            src="https://storage.yandexcloud.net/stickers/stickers-AgAD_g0AAoGJqEg.gif" 
            style={{color: 'transparent'}} 
          />
        </a>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="https://datalens.yandex/iew9k9ycrsi02" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 backdrop-blur-md rounded-full border border-gray-700 hover:bg-gray-700/50 transition-all text-white group"
        >
           <svg 
             className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24" 
             xmlns="http://www.w3.org/2000/svg"
           >
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
           </svg>
           <span className="text-sm font-medium hidden md:inline">{t('statistics')}</span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
