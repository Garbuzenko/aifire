import { NextResponse } from 'next/server';
import pool from '@/utils/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  try {
    // Fetch top risky professions
    const [risky] = await pool.query<RowDataPacket[]>(`
      SELECT id, profession, risk_percentage 
      FROM profession_analysis 
      WHERE is_censored = 0 AND locale = ? AND risk_percentage IS NOT NULL
      ORDER BY risk_percentage DESC 
      LIMIT 5
    `, [locale]);

    // Fetch top safe professions
    const [safe] = await pool.query<RowDataPacket[]>(`
      SELECT id, profession, risk_percentage 
      FROM profession_analysis 
      WHERE is_censored = 0 AND locale = ? AND risk_percentage IS NOT NULL
      ORDER BY risk_percentage ASC 
      LIMIT 5
    `, [locale]);

    return NextResponse.json({ risky, safe });
  } catch (error) {
    console.error('Error fetching top professions:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
