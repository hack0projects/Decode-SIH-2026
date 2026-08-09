require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => {
  res.send('Hello! Mera backend server chal raha hai! 🎉');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: "Database se connected hai! ✅",
      time: result.rows[0].now
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Database connect nahi ho paya",
      details: error.message
    });
  }
});

app.post('/run-code', async (req, res) => {
  const { code, language, studentName } = req.body;

  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      script: code,
      language: language,
      versionIndex: "0"
    });

    const output = response.data.output;
    const hasError = output.toLowerCase().includes('error') || output.toLowerCase().includes('traceback');

    await pool.query(
      'INSERT INTO attempts (student_name, code, language, success, error_message) VALUES ($1, $2, $3, $4, $5)',
      [studentName || 'Unknown', code, language, !hasError, hasError ? output : null]
    );

    res.json({
      output: output,
      success: true,
      hasError: hasError
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Kuch galat ho gaya",
      success: false
    });
  }
});

// UPDATED ROUTE - ab Krishna ka real Dify API use ho raha hai (fake response hata diya)
app.post('/ask-tutor', async (req, res) => {
  const { question, studentName, language } = req.body;

  try {
    const difyResponse = await axios.post(
      process.env.DIFY_API_URL,
      {
        inputs: {
          language: language || "python"
        },
        query: question,
        response_mode: "blocking",
        user: studentName || "unknown-student"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = difyResponse.data.answer;

    await pool.query(
      'INSERT INTO attempts (student_name, code, language, success) VALUES ($1, $2, $3, $4)',
      [studentName || 'Unknown', question, 'question', true]
    );

    res.json({
      answer: answer,
      success: true
    });

  } catch (error) {
    console.error('Dify API error:', error.message);
    res.status(500).json({
      error: "AI tutor se connect nahi ho paya",
      success: false
    });
  }
});

// UPDATED ROUTE - ab Anshita ka Gemini API use ho raha hai translation ke liye
app.post('/translate', async (req, res) => {
  const { text, targetLanguage, studentName } = req.body;

  try {
    const translatePrompt = `Translate the following text into ${targetLanguage}. Only return the translated text, nothing else:\n\n${text}`;

    const geminiResponse = await axios.post(
      `${process.env.TRANSLATE_API_URL}?key=${process.env.TRANSLATE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: translatePrompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const translatedText = geminiResponse.data.candidates[0].content.parts[0].text;

    res.json({
      translatedText: translatedText,
      success: true
    });

  } catch (error) {
    console.error('Translate API error:', error.message);
    res.status(500).json({
      error: "Translation nahi ho paya",
      success: false
    });
  }
});

// NAYA ROUTE - student ke attempts ka summary (Teacher Dashboard ke liye)
app.get('/progress/:studentName', async (req, res) => {
  const { studentName } = req.params;

  try {
    const totalResult = await pool.query(
      'SELECT COUNT(*) FROM attempts WHERE student_name = $1',
      [studentName]
    );

    const successResult = await pool.query(
      'SELECT COUNT(*) FROM attempts WHERE student_name = $1 AND success = true',
      [studentName]
    );

    const languageResult = await pool.query(
      `SELECT language, COUNT(*) as attempt_count
       FROM attempts
       WHERE student_name = $1
       GROUP BY language`,
      [studentName]
    );

    const totalAttempts = parseInt(totalResult.rows[0].count);
    const successfulAttempts = parseInt(successResult.rows[0].count);
    const failedAttempts = totalAttempts - successfulAttempts;

    res.json({
      studentName: studentName,
      totalAttempts: totalAttempts,
      successfulAttempts: successfulAttempts,
      failedAttempts: failedAttempts,
      languageBreakdown: languageResult.rows,
      success: true
    });

  } catch (error) {
    console.error('Progress fetch error:', error.message);
    res.status(500).json({
      error: "Progress data nahi mil paya",
      success: false
    });
  }
});

// NAYA ROUTE - Teacher Dashboard ke liye poori class ka overview ek saath
app.get('/progress-overview', async (req, res) => {
  try {
    const summaryResult = await pool.query(`
      SELECT student_name,
             COUNT(*) as total_attempts,
             COUNT(*) FILTER (WHERE success = true) as successful_attempts,
             COUNT(*) FILTER (WHERE success = false) as failed_attempts
      FROM attempts
      GROUP BY student_name
      ORDER BY student_name
    `);

    // Weak topics - jis language/topic mein sabse zyada fail hue, wahi "weak" maana
    const weakTopicsResult = await pool.query(`
      SELECT student_name, language, COUNT(*) as fail_count
      FROM attempts
      WHERE success = false
      GROUP BY student_name, language
    `);

    const weakTopicsByStudent = {};
    weakTopicsResult.rows.forEach(row => {
      if (!weakTopicsByStudent[row.student_name]) {
        weakTopicsByStudent[row.student_name] = [];
      }
      weakTopicsByStudent[row.student_name].push({
        topic: row.language,
        failCount: parseInt(row.fail_count)
      });
    });

    const overview = summaryResult.rows.map(row => ({
      studentName: row.student_name,
      totalAttempts: parseInt(row.total_attempts),
      successfulAttempts: parseInt(row.successful_attempts),
      failedAttempts: parseInt(row.failed_attempts),
      weakTopics: weakTopicsByStudent[row.student_name] || []
    }));

    res.json({
      students: overview,
      success: true
    });

  } catch (error) {
    console.error('Progress overview error:', error.message);
    res.status(500).json({
      error: "Class overview nahi mil paya",
      success: false
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});