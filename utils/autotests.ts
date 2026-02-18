import pool from './db';
import fs from 'fs';
import path from 'path';

function logError(error: unknown) {
  const logDir = path.join(process.cwd(), 'temp', 'errors');
  const logPath = path.join(logDir, 'errorlog.txt');
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] [AUTOTEST] ${error instanceof Error ? error.message : String(error)}\n${error instanceof Error ? error.stack : ''}\n\n`;
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logPath, message);
  } catch (e) {
    console.error('Failed to write to error log:', e);
  }
}

export async function runAutoTests() {
  if (process.env.autorun_tests !== 'true') {
    console.log('Auto-tests skipped (autorun_tests is not true)');
    return;
  }

  console.log('🚀 Starting auto-tests...');

  // Test 1: Database Connection
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    
    // Test 2: Check if main table exists
    try {
      await connection.query('SELECT 1 FROM profession_analysis LIMIT 1');
      console.log('✅ Table profession_analysis exists and is accessible');
    } catch (e) {
      console.error('❌ Table profession_analysis check failed:', e);
      logError(e);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    logError(error);
  }

  // Test 3: API Health Check (Languages)
  const port = process.env.FRONTEND_PORT || 3000;
  const baseUrl = `http://localhost:${port}`;
  const maxRetries = 5;
  const retryDelay = 2000;

  const checkApi = async (retryCount = 0) => {
    try {
      console.log(`Attempting to fetch languages from ${baseUrl}/api/languages... (Attempt ${retryCount + 1}/${maxRetries})`);
      const response = await fetch(`${baseUrl}/api/languages`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
           console.log(`✅ Language API check successful (${data.length} languages found)`);
        } else {
           const err = new Error('Language API returned invalid data');
           console.error(`❌ ${err.message}`);
           logError(err);
        }
      } else {
        const err = new Error(`Language API returned status: ${response.status}`);
        console.error(`❌ ${err.message}`);
        logError(err);
      }
    } catch (error) {
      if (retryCount < maxRetries - 1) {
        console.log(`⚠️ API check failed, retrying in ${retryDelay/1000}s...`);
        setTimeout(() => checkApi(retryCount + 1), retryDelay);
      } else {
        console.error('❌ Language API check failed after multiple attempts (Server might not be ready):', error);
        logError(error);
      }
    }
  };

  // Start checking API after a short delay
  setTimeout(() => checkApi(), 3000);
}
