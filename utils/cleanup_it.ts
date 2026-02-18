import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const STRICT_IT_KEYWORDS = [
  'разработчик', 'программист', 'developer', 'programmer', 'java', 'python', 'php', 'frontend', 'backend', 
  'fullstack', 'devops', 'qa', 'tester', 'тестировщик', 'системный администратор', 'admin', 'data scientist', 
  'аналитик', 'product manager', 'project manager', 'aqa', '1с', '1c', 'ai', 'ml', 'software', 'web', 'game', 
  'android', 'ios', 'sql', 'db', 'database', 'network', 'cloud', 'aws', 'azure', 'linux', 'windows', 'c++', 
  'c#', 'go', 'rust', 'ruby', 'js', 'ts', 'node', 'react', 'vue', 'angular', 'html', 'css', 'git', 'docker', 
  'kubernetes', 'tech', 'support', 'helpdesk', 'сисадмин', 'поддержка', 'проджект', 'продукт', 'архитектор по',
  'архитектор ис', 'архитектор решений', 'системный', 'computer', 'vision', 'embedded', 'machine learning',
  'data', 'science', 'engineering', 'engineer' // engineer is generic but often IT in this context if mapped to IT
];

// Engineer mapped to Production usually, but if it's "software engineer" it's IT.
// My previous script mapped "engineer" to Production.
// But "software engineer" -> IT.

async function cleanupIT() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  });

  try {
    console.log('Connected to database.');

    const [rows] = await connection.execute('SELECT id, profession, prof_type FROM profession_analysis WHERE prof_type = "Информационные технологии"');
    
    let cleanedCount = 0;

    for (const row of (rows as any[])) {
      const professionLower = row.profession.toLowerCase();
      let isIT = false;

      for (const keyword of STRICT_IT_KEYWORDS) {
        if (professionLower.includes(keyword)) {
          isIT = true;
          break;
        }
      }

      if (!isIT) {
        // Double check common false negatives
        if (professionLower.includes('ит') && (professionLower.includes('директор') || professionLower.includes('начальник') || professionLower.includes('руководитель'))) {
            // "директор по ит", "начальник ит отдела" - keep as IT or Management?
            // Usually Management, but IT is also fine.
            // But "заместитель" matched "ит".
            // If it has "ит " (with space) or "it" (latin), keep it.
            if (professionLower.includes('ит ') || professionLower.includes(' it ') || professionLower.endsWith(' it') || professionLower.startsWith('it ')) {
                isIT = true;
            }
        }
      }

      if (!isIT) {
        console.log(`Cleaning up (removing IT type): ${row.profession}`);
        await connection.execute('UPDATE profession_analysis SET prof_type = NULL WHERE id = ?', [row.id]);
        cleanedCount++;
      }
    }

    console.log(`Cleaned ${cleanedCount} rows.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

cleanupIT();
