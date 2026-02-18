import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import pool, { initDB } from '../../../../utils/db';
import { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

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
        'SELECT analysis_json, request_count FROM profession_analysis WHERE profession = ? AND locale = ?',
        [normalizedJobTitle, locale]
      );

      if (rows.length > 0) {
        const existingAnalysis = rows[0];
        
        // Increment request count
        await pool.execute(
          'UPDATE profession_analysis SET request_count = request_count + 1 WHERE profession = ? AND locale = ?',
          [normalizedJobTitle, locale]
        );

        return NextResponse.json(existingAnalysis.analysis_json);
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
      
      JSON Structure required:
      {
        "risk_score": (number 0-100),
        "verdict": (short punchy title),
        "reasoning": (2 sentences explanation),
        "safe_skills": (array of 3 skills hard to automate),
        "replaced_tasks": (array of 3 tasks AI will take over)
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
    try {
      await pool.execute(
        'INSERT INTO profession_analysis (profession, locale, analysis_json, risk_percentage) VALUES (?, ?, ?, ?)',
        [normalizedJobTitle, locale, JSON.stringify(data), data.risk_score]
      );
    } catch (dbError) {
      console.error("Database error (write):", dbError);
      logError(dbError);
      // Continue even if save fails
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("API Error:", error);
    logError(error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
