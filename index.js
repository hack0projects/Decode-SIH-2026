require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

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
  const { question, studentName } = req.body;

  try {
    const difyResponse = await axios.post(
      process.env.DIFY_API_URL,
      {
        inputs: {},
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

app.post('/translate', async (req, res) => {
  const { text, targetLanguage, studentName } = req.body;

  const fakeTranslation = `[${targetLanguage} mein translate hua]: ${text}`;

  res.json({
    translatedText: fakeTranslation,
    success: true
  });
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});