import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixFalsePositives() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  });

  try {
    console.log('Connected to database.');

    // 1. Uncensor "парикмахер"
    await connection.execute('UPDATE profession_analysis SET is_censored = 0 WHERE profession LIKE "%парикмахер%"');
    console.log('Uncensored парикмахер');

    // 2. Fix "руководитель" -> Management
    await connection.execute('UPDATE profession_analysis SET prof_type = "Высший и средний менеджмент" WHERE profession LIKE "%руководитель%"');
    console.log('Fixed руководитель -> Management');

    // 3. Fix "администратор" -> Admin (unless IT)
    await connection.execute('UPDATE profession_analysis SET prof_type = "Административный персонал" WHERE profession LIKE "%администратор%" AND prof_type != "Информационные технологии"');
    
    // Fix specific IT admins
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%администратор баз данных%"');
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%системный администратор%"');
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%сетевой администратор%"');
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%администрирования%"');
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%database administrator%"');
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%admin%" AND profession NOT LIKE "%admin%istr%"'); // admin but not administrator (already handled)
    console.log('Fixed администратор');

    // 4. Fix "president" -> Management/Gov
    await connection.execute('UPDATE profession_analysis SET prof_type = "Государственная служба" WHERE profession LIKE "%president%" OR profession LIKE "%президент%"');
    console.log('Fixed president');

    // 5. Fix "project" / "product" -> IT/Management (if mapped to Marketing due to "pr")
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%project%" AND prof_type = "Маркетинг, реклама, PR"');
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%product%" AND prof_type = "Маркетинг, реклама, PR"');
    
    // Fix "project engineer" -> Production
    await connection.execute('UPDATE profession_analysis SET prof_type = "Производство, сервисное обслуживание" WHERE profession LIKE "%project engineer%"');
    console.log('Fixed project/product false positives');

    // 7. Fix "prompt" -> IT
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%prompt%"');
    console.log('Fixed prompt');

    // 8. Fix "program manager" -> IT
    await connection.execute('UPDATE profession_analysis SET prof_type = "Информационные технологии" WHERE profession LIKE "%program manager%"');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixFalsePositives();
