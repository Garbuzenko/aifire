import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import pool, { initDB } from '../../../../utils/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

// List of profession categories
const PROF_TYPES = [
  "Автомобильный бизнес", "Административный персонал", "Безопасность", "Высший и средний менеджмент",
  "Добыча сырья", "Домашний, обслуживающий персонал", "Закупки", "Информационные технологии",
  "Искусство, развлечения, массмедиа", "Маркетинг, реклама, PR", "Медицина, фармацевтика",
  "Наука, образование", "Продажи, обслуживание клиентов", "Производство, сервисное обслуживание",
  "Рабочий персонал", "Розничная торговля", "Сельское хозяйство", "Спортивные клубы, фитнес, салоны красоты",
  "Стратегия, инвестиции, консалтинг", "Страхование", "Строительство, недвижимость",
  "Транспорт, логистика, перевозки", "Туризм, гостиницы, рестораны", "Управление персоналом, тренинги",
  "Финансы, бухгалтерия", "Юристы"
];

let isDBInitialized = false;

function logError(error: unknown) {
  const logDir = path.join(process.cwd(), 'temp', 'errors');
  const logPath = path.join(logDir, 'errorlog.txt');
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${error instanceof Error ? error.message : String(error)}\n${error instanceof Error ? error.stack : ''}\n\n`;
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logPath, message);
  } catch (e) {
    console.error('Failed to write to error log:', e);
  }
}

export async function POST(req: Request) {
  try {
    const { jobTitle, locale } = await req.json();
    const normalizedJobTitle = jobTitle.trim().toLowerCase();

    if (!isDBInitialized) {
      await initDB();
      isDBInitialized = true;
    }

    // Check if analysis exists in DB
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, analysis_json, request_count, is_censored FROM profession_analysis WHERE profession = ? AND locale = ?',
        [normalizedJobTitle, locale]
      );

      if (rows.length > 0) {
        const existingAnalysis = rows[0];
        
        // Increment request count
        await pool.execute(
          'UPDATE profession_analysis SET request_count = request_count + 1 WHERE profession = ? AND locale = ?',
          [normalizedJobTitle, locale]
        );

        if (existingAnalysis.is_censored) {
             // Ensure analysis_json is an object if it comes as string from DB
             let jsonResponse = existingAnalysis.analysis_json;
             if (typeof jsonResponse === 'string') {
                try {
                    jsonResponse = JSON.parse(jsonResponse);
                } catch (e) {
                    // keep as is
                }
             }
             return NextResponse.json({ ...jsonResponse });
        }

        let jsonResponse = existingAnalysis.analysis_json;
        if (typeof jsonResponse === 'string') {
            try {
                jsonResponse = JSON.parse(jsonResponse);
            } catch (e) {
                // keep as is
            }
        }

        return NextResponse.json({ ...jsonResponse, id: existingAnalysis.id });
      }
    } catch (dbError) {
      console.error("Database error (read):", dbError);
      logError(dbError);
      // Continue to AI analysis if DB fails
    }

    const systemPrompt = `
      You are an expert AI Job Market Analyst.
      Analyze the user's profession and return a JSON object.
      Language of response: ${locale}.
      
      First, determine if the user input is a valid profession or a specific branch of a profession.
      
      STRICT CENSORSHIP RULES:
      Set "is_censored" to true (and "is_profession" to false) if ANY of the following are true:
      1. It is NOT a profession or a recognized branch of a profession.
      2. It relates to POLITICS (politicians, political movements, ideologies, etc.).
      3. It relates to RELIGION (religious figures, practices, beliefs, etc.).
      4. It contains PROFANITY, MAT, or offensive language.
      5. It relates to SEX, ADULT themes, or pornography.
      
      Only if NONE of the above apply, set "is_censored" to false and "is_profession" to true.

      Classify the profession into exactly one of these categories (field "prof_type"):
      ${JSON.stringify(PROF_TYPES)}

      JSON Structure required:
      {
        "is_profession": (boolean),
        "is_censored": (boolean),
        "prof_type": (string, exactly one from the list above),
        "risk_score": (number 0-100, set to 0 if censored),
        "verdict": (short punchy title, or "Invalid Input" if censored),
        "reasoning": (2 sentences explanation),
        "safe_skills": (array of 3 skills hard to automate, empty if censored),
        "replaced_tasks": (array of 3 tasks AI will take over, empty if censored)
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Profession: ${jobTitle}` }
      ],
      model: "deepseek-chat",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    
    let data;
    try {
      data = JSON.parse(content || '{}');
    } catch (e) {
      console.error("Failed to parse JSON from DeepSeek", content);
      logError(e);
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
    }

    // Save to DB
    let insertId: number | undefined;
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        'INSERT INTO profession_analysis (profession, locale, analysis_json, risk_percentage, is_censored, prof_type) VALUES (?, ?, ?, ?, ?, ?)',
        [
            normalizedJobTitle, 
            locale, 
            JSON.stringify(data), 
            data.risk_score || 0, 
            data.is_censored || false,
            data.prof_type || null
        ]
      );
      insertId = result.insertId;
    } catch (dbError: any) {
      if (dbError.code === 'ER_DUP_ENTRY') {
          console.log(`Duplicate entry for ${normalizedJobTitle} (${locale}), fetching existing ID...`);
          try {
             const [rows] = await pool.execute<RowDataPacket[]>(
                'SELECT id FROM profession_analysis WHERE profession = ? AND locale = ?',
                [normalizedJobTitle, locale]
            );
            if (rows.length > 0) {
                insertId = rows[0].id;
            }
          } catch (selectError) {
             console.error("Failed to fetch existing ID after duplicate error:", selectError);
             logError(selectError);
          }
      } else {
          console.error("Database error (write):", dbError);
          logError(dbError);
      }
      // Continue even if save fails
    }

    if (data.is_censored) {
        return NextResponse.json({ ...data });
    }

    return NextResponse.json({ ...data, id: insertId });

  } catch (error) {
    console.error("API Error:", error);
    logError(error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
