import { NextResponse } from 'next/server';
import pool from '@/utils/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sort = searchParams.get('sort') || 'risk_desc'; // risk_desc, risk_asc

  const offset = (page - 1) * limit;

  let orderBy = 'risk_percentage DESC';
  if (sort === 'risk_asc') {
    orderBy = 'risk_percentage ASC';
  }

  try {
    // Get total count
    const [countResult] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total
      FROM profession_analysis 
      WHERE is_censored = 0 AND locale = ? AND risk_percentage IS NOT NULL
    `, [locale]);
    
    const total = countResult[0].total;

    // Get paginated data
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id, profession, risk_percentage 
      FROM profession_analysis 
      WHERE is_censored = 0 AND locale = ? AND risk_percentage IS NOT NULL
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [locale, limit, offset]);

    return NextResponse.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching professions list:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
