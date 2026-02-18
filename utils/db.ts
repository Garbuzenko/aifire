import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
    } catch (e: any) {
      // Ignore error if column already exists
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.error('Failed to add risk_percentage column:', e);
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
