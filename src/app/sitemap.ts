import { MetadataRoute } from 'next';
import pool from '@/utils/db';
import { RowDataPacket } from 'mysql2';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT url, last_modified, change_frequency, priority 
       FROM sitemap`
    );

    return rows.map((row) => ({
      url: row.url,
      lastModified: new Date(row.last_modified),
      changeFrequency: row.change_frequency as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
      priority: row.priority,
    }));
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return [];
  }
}
