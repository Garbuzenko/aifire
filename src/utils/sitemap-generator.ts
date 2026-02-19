import 'dotenv/config';
import pool, { initDB } from '../../utils/db';
import { locales } from '../locales';
import { RowDataPacket } from 'mysql2';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-fire.ru';

async function generateSitemap() {
  console.log('Starting sitemap generation...');

  try {
    // Ensure table exists
    await initDB();

    // Clear existing sitemap
    await pool.execute('TRUNCATE TABLE sitemap');
    console.log('Sitemap table truncated.');

    const values: any[] = [];
    const placeholders: string[] = [];

    // 1. Static pages for each locale
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}`;
      const lastModified = new Date();
      const changeFrequency = 'daily';
      const priority = 1.0;

      values.push(url, lastModified, changeFrequency, priority);
      placeholders.push('(?, ?, ?, ?)');
    }

    if (placeholders.length > 0) {
      const query = `
        INSERT INTO sitemap (url, last_modified, change_frequency, priority)
        VALUES ${placeholders.join(', ')}
      `;
      await pool.execute(query, values);
      console.log(`Inserted ${placeholders.length} static pages.`);
    }

    // 2. Dynamic profession pages
    // Fetch recent professions that are not censored
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, locale, updated_at 
       FROM profession_analysis 
       WHERE is_censored = FALSE`
    );

    if (rows.length > 0) {
      const dynamicValues: any[] = [];
      const dynamicPlaceholders: string[] = [];
      const batchSize = 1000; // Insert in batches to avoid query size limits

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const url = `${BASE_URL}/${row.locale}/profession/${row.id}`;
        const lastModified = new Date(row.updated_at);
        const changeFrequency = 'weekly';
        const priority = 0.8;

        dynamicValues.push(url, lastModified, changeFrequency, priority);
        dynamicPlaceholders.push('(?, ?, ?, ?)');

        // Execute batch if limit reached or last item
        if (dynamicPlaceholders.length >= batchSize || i === rows.length - 1) {
          const query = `
            INSERT INTO sitemap (url, last_modified, change_frequency, priority)
            VALUES ${dynamicPlaceholders.join(', ')}
          `;
          await pool.execute(query, dynamicValues);
          console.log(`Inserted batch of ${dynamicPlaceholders.length} dynamic pages.`);
          
          // Reset batch
          dynamicValues.length = 0;
          dynamicPlaceholders.length = 0;
        }
      }
      console.log(`Total dynamic pages processed: ${rows.length}`);
    } else {
      console.log('No dynamic pages found.');
    }

    console.log('Sitemap generation completed successfully.');

  } catch (error) {
    console.error('Sitemap generation failed:', error);
  } finally {
    await pool.end();
  }
}

generateSitemap();
