'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Profession {
  id: number;
  profession: string;
  risk_percentage: number;
}

interface ApiResponse {
  data: Profession[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function ProfessionsList() {
  const t = useTranslations('Index');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = Array.isArray(params.locale) ? params.locale[0] : params.locale;
  
  const initialSort = searchParams.get('sort') || 'risk_desc';
  const [sort, setSort] = useState(initialSort);
  const [professions, setProfessions] = useState<Profession[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Reset when sort changes
  useEffect(() => {
    setProfessions([]);
    setPage(1);
    setHasMore(true);
    fetchProfessions(1, sort, true);
  }, [sort, locale]);

  const fetchProfessions = async (pageNum: number, sortOrder: string, reset: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/professions/list?locale=${locale}&page=${pageNum}&limit=50&sort=${sortOrder}`);
      const data: ApiResponse = await res.json();
      
      if (reset) {
        setProfessions(data.data);
      } else {
        setProfessions(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch professions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProfessions(nextPage, sort);
  };

  const handleSortChange = (newSort: string) => {
    if (sort === newSort) return;
    setSort(newSort);
    // Update URL without refresh
    router.replace(`/${locale}/professions?sort=${newSort}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        href={`/${locale}`}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors flex items-center gap-2 shadow-lg border border-gray-700"
      >
        ← {t('back_to_home')}
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          {t('all_professions')}
        </h1>
        
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => handleSortChange('risk_desc')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sort === 'risk_desc' 
                ? 'bg-red-900/40 text-red-400 border border-red-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t('sort_risk_desc')}
          </button>
          <button
            onClick={() => handleSortChange('risk_asc')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sort === 'risk_asc' 
                ? 'bg-green-900/40 text-green-400 border border-green-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t('sort_risk_asc')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {professions.map((p, index) => (
          <motion.div
            key={`${p.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index % 10 * 0.05 }}
          >
            <Link 
              href={`/${locale}/profession/${p.id}`}
              className={`block p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                p.risk_percentage > 70 
                  ? 'bg-red-950/20 border-red-500/20 hover:bg-red-950/30 hover:border-red-500/40' 
                  : p.risk_percentage > 30
                  ? 'bg-yellow-950/20 border-yellow-500/20 hover:bg-yellow-950/30 hover:border-yellow-500/40'
                  : 'bg-green-950/20 border-green-500/20 hover:bg-green-950/30 hover:border-green-500/40'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-200 font-medium line-clamp-2">
                  {p.profession}
                </span>
                <span className={`font-mono font-bold text-lg ${
                  p.risk_percentage > 70 ? 'text-red-500' : 
                  p.risk_percentage > 30 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {p.risk_percentage}%
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!loading && hasMore && (
        <div className="flex justify-center mt-8 pb-12">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors border border-gray-700"
          >
            {t('load_more')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfessionsPage() {
  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
      <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>}>
        <ProfessionsList />
      </Suspense>
    </main>
  );
}
