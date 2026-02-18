import { notFound } from 'next/navigation';
import pool from '../../../../../utils/db';
import { RowDataPacket } from 'mysql2';
import { getTranslations } from 'next-intl/server';
import ShareButton from '@/app/components/ShareButton';
import Link from 'next/link';

interface AnalysisResult {
  risk_score: number;
  verdict: string;
  reasoning: string;
  safe_skills: string[];
  replaced_tasks: string[];
}

interface ProfessionData extends RowDataPacket {
  id: number;
  profession: string;
  locale: string;
  analysis_json: AnalysisResult;
  risk_percentage: number;
  is_censored: number;
  request_count: number;
  created_at: Date;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  
  try {
    const [rows] = await pool.execute<ProfessionData[]>(
      'SELECT profession, is_censored FROM profession_analysis WHERE id = ? AND is_censored = 0',
      [id]
    );

      if (rows.length === 0 || rows[0].is_censored) {
      const t = await getTranslations({ locale, namespace: 'Index' });
      return {
        title: t('profession_not_found'),
      };
    }

    const profession = rows[0].profession;
    const t = await getTranslations({ locale, namespace: 'Index' });

    return {
      title: `${profession} - ${t('meta_title')}`,
      description: `${t('meta_description')} - ${profession}`,
    };
  } catch (error) {
    console.error('Metadata error:', error);
    const t = await getTranslations({ locale, namespace: 'Index' });
    return {
      title: t('error_title'),
    };
  }
}

export default async function ProfessionPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  let analysis: ProfessionData | null = null;

  try {
    // Increment request count first
    await pool.execute(
      'UPDATE profession_analysis SET request_count = request_count + 1 WHERE id = ?',
      [id]
    );

    // Fetch analysis
    const [rows] = await pool.execute<ProfessionData[]>(
      'SELECT * FROM profession_analysis WHERE id = ? AND is_censored = 0',
      [id]
    );

    if (rows.length > 0 && !rows[0].is_censored) {
      analysis = rows[0];
      
      // Ensure analysis_json is an object
      if (typeof analysis.analysis_json === 'string') {
        try {
          analysis.analysis_json = JSON.parse(analysis.analysis_json);
        } catch (e) {
          console.error('Failed to parse analysis_json:', e);
          analysis = null;
        }
      }
    }
  } catch (error) {
    console.error('Database error:', error);
    // Handle error appropriately
  }

  if (!analysis) {
    notFound();
  }

  const result = analysis.analysis_json;

  if (!result) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-white">
        <h1 className="text-2xl font-bold text-red-500">{t('error_title')}</h1>
        <Link href={`/${locale}`} className="mt-4 text-blue-400 hover:underline">
          {t('back_button')}
        </Link>
      </main>
    );
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-fire.ru'}/${locale}/profession/${id}`;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start md:justify-center p-4 pt-24 pb-12 md:p-8 bg-black text-white relative overflow-y-auto">
      
      {/* Back to Home */}
      <Link 
        href={`/${locale}`}
        className="fixed top-4 left-4 z-50 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors flex items-center gap-2"
      >
        ← {t('back_button')}
      </Link>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
          {analysis.profession}
        </h1>
        
        <div className="mb-8 text-gray-400 text-sm uppercase tracking-widest flex items-center gap-2">
          <span>👁️ {analysis.request_count} {t('views')}</span>
          <span>•</span>
          <span>{new Date(analysis.created_at).toLocaleDateString(locale)}</span>
        </div>

        <div className="mt-6 md:mt-10 p-4 md:p-8 border border-gray-800 rounded-2xl md:rounded-3xl bg-gray-900/90 backdrop-blur-xl w-full shadow-2xl shadow-purple-500/20">
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
          
          <div className="flex justify-center mt-8 pt-6 border-t border-gray-800">
            <ShareButton 
              url={shareUrl} 
              title={analysis.profession} 
              riskScore={result.risk_score}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
