import { ImageResponse } from 'next/og';
import pool from '../../../../../utils/db';
import { RowDataPacket } from 'mysql2';

export const runtime = 'nodejs';

export const alt = 'AI Risk Analysis';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

interface ProfessionData extends RowDataPacket {
  profession: string;
  risk_percentage: number;
  is_censored: number;
}

export default async function Image({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  
  let profession = 'Profession';
  let risk = 0;

  try {
    const [rows] = await pool.execute<ProfessionData[]>(
      'SELECT profession, risk_percentage, is_censored FROM profession_analysis WHERE id = ? AND is_censored = 0',
      [id]
    );

    if (rows.length > 0 && !rows[0].is_censored) {
      profession = rows[0].profession;
      risk = rows[0].risk_percentage;
    }
  } catch (e) {
    console.error('OG Image DB Error:', e);
  }

  // Determine color based on risk
  let color = '#4ade80'; // green-400
  if (risk > 30) color = '#facc15'; // yellow-400
  if (risk > 70) color = '#ef4444'; // red-500

  return new ImageResponse(
    (
      <div
        style={{
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom right, #1a1a1a, #000000)',
            zIndex: -1,
          }}
        />
        
        {/* Decorative Circle */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '20px' }}>
          <div style={{ fontSize: 30, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '4px' }}>
            Will AI Take My Job?
          </div>
          
          <div style={{ fontSize: 80, fontWeight: 'bold', color: 'white', textAlign: 'center', maxWidth: '1000px', lineHeight: 1.1 }}>
            {profession}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            <div style={{ fontSize: 40, color: '#d1d5db' }}>Risk:</div>
            <div style={{ fontSize: 140, fontWeight: '900', color: color, lineHeight: 1 }}>
              {risk}%
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(to right, #c084fc, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>AI</div>
            <div style={{ fontSize: 24, color: '#e5e7eb' }}>ai-fire.ru</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
