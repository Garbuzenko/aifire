'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';

import ShareButton from '@/app/components/ShareButton';
import ProfessionStats from '@/app/components/ProfessionStats';

interface AnalysisResult {
  id?: number;
  risk_score: number;
  verdict: string;
  reasoning: string;
  safe_skills: string[];
  replaced_tasks: string[];
}

export default function Home() {
  const t = useTranslations('Index');
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!job) return;
    setLoading(true);
    setResult(null);
    const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: job, locale }),
      });
      const data = await res.json() as AnalysisResult;
      
      if (data.id) {
        router.push(`/${locale}/profession/${data.id}`);
      } else {
        setResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start md:justify-center p-4 pb-12 md:p-8 bg-black text-white relative overflow-y-auto">

      <div className="z-10 w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 md:mb-8 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-pulse mt-4 md:mt-0">
          {t('title')}
        </h1>

        <div className="w-full max-w-md space-y-4">
          <input
            type="text"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full p-3 md:p-4 rounded-xl bg-gray-900/80 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all text-base md:text-lg"
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          
          <button
            onClick={handleAnalyze}
            disabled={loading || !job}
            className="w-full p-3 md:p-4 rounded-xl bg-white text-black font-bold text-lg md:text-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('loading') : t('button')}
          </button>
        </div>

        {!result && <ProfessionStats />}

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 md:mt-10 p-4 md:p-8 border border-gray-800 rounded-2xl md:rounded-3xl bg-gray-900/90 backdrop-blur-xl w-full shadow-2xl shadow-purple-500/20"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">{t('risk_label')}</div>
                <div className={`text-6xl md:text-8xl font-black ${result.risk_score > 70 ? 'text-red-500' : result.risk_score > 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {result.risk_score}%
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2 text-white">{result.verdict}</h2>
                <p className="text-gray-300 text-lg leading-relaxed">{result.reasoning}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
                <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                  <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                    🛡️ {t('skills_label')}
                  </h3>
                  <ul className="space-y-2">
                    {result.safe_skills?.map((skill: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300">• {skill}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                  <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                    🤖 {t('tasks_label')}
                  </h3>
                  <ul className="space-y-2">
                    {result.replaced_tasks?.map((task: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300">• {task}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.id && (
                <div className="flex justify-center mt-8 pt-6 border-t border-gray-800">
                  <ShareButton 
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${Array.isArray(params.locale) ? params.locale[0] : params.locale}/profession/${result.id}`} 
                    title={job}
                    riskScore={result.risk_score}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
