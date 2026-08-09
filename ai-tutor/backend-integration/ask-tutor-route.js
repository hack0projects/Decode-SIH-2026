// ============================================
// /ask-tutor route — connects to Krishna's Dify bot
// ============================================

require('dotenv').config();
const express = require('express');
const router = express.Router();

// Add these to her .env file:
// DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxx
// DIFY_API_URL=https://api.dify.ai/v1

router.post('/ask-tutor', async (req, res) => {
  try {
    const { query, language, student_id, conversation_id } = req.body;

    // Basic validation — don't call Dify with empty stuff
    if (!query || !language || !student_id) {
      return res.status(400).json({
        error: 'query, language, and student_id are required'
      });
    }

    const difyResponse = await fetch(`${process.env.DIFY_API_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          language: language // this feeds your metadata filter in Dify
        },
        query: query,
        response_mode: 'blocking', // 'streaming' is also possible later, blocking is simpler for now
        conversation_id: conversation_id || '', // empty string = start new conversation
        user: student_id // Dify uses this to track the user
      })
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error('Dify API error:', errorText);
      return res.status(502).json({ error: 'Tutor service unavailable, try again' });
    }

    const data = await difyResponse.json();

    // Save this interaction to Supabase 'attempts' table (or a new 'tutor_logs' table)
    // Kritika — plug your existing supabase client in here:
    /*
    await supabase.from('tutor_logs').insert({
      student_id: student_id,
      language: language,
      question: query,
      answer: data.answer,
      conversation_id: data.conversation_id,
      created_at: new Date()
    });
    */

    return res.json({
      answer: data.answer,
      conversation_id: data.conversation_id // send this back to frontend, they must pass it on next message to keep chat context
    });

  } catch (err) {
    console.error('ask-tutor route error:', err);
    return res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

module.exports = router;
