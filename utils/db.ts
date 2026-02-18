import mysql from 'mysql2/promise';

interface MySqlError {
  code: string;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  charset: 'utf8mb4'
});

export default pool;

export async function initDB() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profession_analysis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        profession VARCHAR(255) NOT NULL,
        locale VARCHAR(10) NOT NULL,
        analysis_json JSON,
        risk_percentage INT,
        is_censored BOOLEAN DEFAULT FALSE,
        request_count INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_profession_locale (profession, locale)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    try {
      await connection.query(`
        ALTER TABLE profession_analysis
        ADD COLUMN risk_percentage INT;
      `);
    } catch (e: unknown) {
      // Ignore error if column already exists
      const error = e as MySqlError;
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Failed to add risk_percentage column:', e);
      }
    }

    try {
      await connection.query(`
        ALTER TABLE profession_analysis
        ADD COLUMN is_censored BOOLEAN DEFAULT FALSE;
      `);
    } catch (e: unknown) {
      // Ignore error if column already exists
      const error = e as MySqlError;
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Failed to add is_censored column:', e);
      }
    }

    try {
      await connection.query(`
        ALTER TABLE profession_analysis
        ADD COLUMN prof_type VARCHAR(255);
      `);
    } catch (e: unknown) {
      // Ignore error if column already exists
      const error = e as MySqlError;
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.error('Failed to add prof_type column:', e);
      }
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}
