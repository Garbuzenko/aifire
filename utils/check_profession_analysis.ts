import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkProfessionAnalysis() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  });

  try {
    const [rows] = await connection.execute('SELECT id, profession, is_censored, prof_type FROM profession_analysis');
    
    console.log(`Total rows: ${(rows as any[]).length}`);

    const missingProfType = (rows as any[]).filter(r => !r.prof_type && !r.is_censored);
    console.log(`Missing prof_type (not censored): ${missingProfType.length}`);

    if (missingProfType.length > 0) {
      console.log('--- Missing prof_type examples (first 20) ---');
      missingProfType.slice(0, 20).forEach(r => {
        console.log(`${r.id}: ${r.profession}`);
      });
    }

    const censored = (rows as any[]).filter(r => r.is_censored);
    console.log(`Censored rows: ${censored.length}`);
    if (censored.length > 0) {
        console.log('--- Censored examples (first 10) ---');
        censored.slice(0, 10).forEach(r => {
            console.log(`${r.id}: ${r.profession}`);
        });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkProfessionAnalysis();
