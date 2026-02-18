'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Profession {
  id: number;
  profession: string;
  risk_percentage: number;
}

interface StatsData {
  risky: Profession[];
  safe: Profession[];
}

export default function ProfessionStats() {
  const t = useTranslations('Index');
  const params = useParams();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch(`/api/professions/top?locale=${locale}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, [locale]);

  if (!data || (!data.risky.length && !data.safe.length)) return null;

  return (
    <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base animate-fade-in">
      {/* Risky Professions */}
      {data.risky.length > 0 && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-5 backdrop-blur-sm hover:bg-red-950/40 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-red-400 font-bold text-lg flex items-center gap-2">
              {t('top_risk_today')}
            </h3>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {data.risky.map((p, i) => (
              <Link 
                key={p.id} 
                href={`/${locale}/profession/${p.id}`}
                className="group inline-flex items-center gap-1 hover:text-red-300 transition-colors"
              >
                <span className="text-gray-300 group-hover:text-white border-b border-dotted border-gray-600 group-hover:border-white transition-all">
                  {p.profession}
                </span>
                <span className="text-red-500 font-mono font-bold text-xs">
                  {p.risk_percentage}%
                </span>
                {i < data.risky.length - 1 && <span className="text-gray-600">,</span>}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Link 
              href={`/${locale}/professions?sort=risk_desc`}
              className="text-sm font-medium text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 px-3 py-1.5 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-95"
            >
              {t('view_all_risk')}
            </Link>
          </div>
        </div>
      )}

      {/* Safe Professions */}
      {data.safe.length > 0 && (
        <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-5 backdrop-blur-sm hover:bg-green-950/40 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-green-400 font-bold text-lg flex items-center gap-2">
              {t('top_safety')}
            </h3>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {data.safe.map((p, i) => (
              <Link 
                key={p.id} 
                href={`/${locale}/profession/${p.id}`}
                className="group inline-flex items-center gap-1 hover:text-green-300 transition-colors"
              >
                <span className="text-gray-300 group-hover:text-white border-b border-dotted border-gray-600 group-hover:border-white transition-all">
                  {p.profession}
                </span>
                <span className="text-green-500 font-mono font-bold text-xs">
                  {p.risk_percentage}%
                </span>
                {i < data.safe.length - 1 && <span className="text-gray-600">,</span>}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Link 
              href={`/${locale}/professions?sort=risk_asc`}
              className="text-sm font-medium text-green-300 hover:text-green-200 bg-green-950/40 hover:bg-green-900/60 border border-green-500/30 px-3 py-1.5 rounded-lg transition-all hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] active:scale-95"
            >
              {t('view_all_safe')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
