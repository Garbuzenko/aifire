'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full mt-auto border-t border-purple-500/20 bg-black overflow-hidden">
      {/* Gradient top border effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-purple-200/70">{t('powered_by')}</span>
              <Link 
                href="https://ai-fire.ru" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 hover:from-purple-300 hover:via-pink-400 hover:to-red-400 transition-all duration-300"
              >
                AI Founders
              </Link>
            </motion.div>
            <p className="text-xs text-purple-200/40">
              © {currentYear} AI Founders. All rights reserved.
            </p>
          </div>

          {/* Social / Community Link */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.div 
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="https://t.me/aifoundersru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 px-5 py-2.5 rounded-full bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <svg 
                className="w-5 h-5 text-purple-300/70 group-hover:text-[#229ED9] transition-colors duration-300" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              <span className="text-sm font-medium text-purple-100/90 group-hover:text-white transition-colors relative z-10">
                {t('community')}
              </span>
            </Link>
          </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
