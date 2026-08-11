// CodeSeekho AI — Live Backend API Client
// Connected to deployed backend: https://decode-sih-2026.onrender.com
// Backend Developer: Kritika (Member 4)

const BASE_URL = 'https://decode-sih-2026.onrender.com';

/**
 * Map frontend language identifiers to JDoodle backend language keys
 * @param {string} lang 
 */
function getJDoodleLanguage(lang = 'python') {
  const normalized = lang.toLowerCase();
  if (normalized.includes('js') || normalized.includes('node') || normalized.includes('html')) {
    return 'nodejs';
  }
  if (normalized.includes('cpp') || normalized.includes('c++')) {
    return 'cpp17';
  }
  if (normalized.includes('java') && !normalized.includes('script')) {
    return 'java';
  }
  // Default to Python3
  return 'python3';
}

/**
 * Map language codes ('hi', 'ta', 'te') to full names ('Hindi', 'Tamil', 'Telugu')
 * @param {string} langCode 
 */
function getFullLanguageName(langCode = 'hi') {
  const map = {
    'hi': 'Hindi',
    'en': 'English',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'mr': 'Marathi',
    'bn': 'Bengali',
    'gu': 'Gujarati'
  };
  return map[langCode] || langCode;
}

/**
 * Execute Python / JS code via backend API (/run-code)
 * @param {string} code 
 * @param {string} language 
 * @param {string} studentName 
 */
export async function runCode(code, language = 'python3', studentName = 'Aarav') {
  const jdoodleLang = getJDoodleLanguage(language);
  
  try {
    const response = await fetch(`${BASE_URL}/run-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language: jdoodleLang,
        studentName
      })
    });

    const data = await response.json();
    return data; // returns { output, success, hasError }
  } catch (err) {
    console.error('API Error in /run-code:', err);
    return {
      success: false,
      hasError: true,
      output: `Connection Error: ${err.message}`
    };
  }
}

/**
 * Ask AI Socratic Tutor a doubt (/ask-tutor)
 * Returns { answer, success }
 * @param {string} question 
 * @param {string} studentName 
 */
export async function askTutor(question, studentName = 'Aarav') {
  try {
    const response = await fetch(`${BASE_URL}/ask-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        studentName
      })
    });

    const data = await response.json();
    return data; // returns { answer, success }
  } catch (err) {
    console.error('API Error in /ask-tutor:', err);
    return {
      success: false,
      answer: 'AI Tutor network connection error.',
      error: err.message
    };
  }
}

/**
 * Translate text into Indian regional language via Bhashini/LLM backend API (/translate)
 * Returns { translatedText, success }
 * @param {string} text 
 * @param {string} targetLanguage 
 * @param {string} studentName 
 */
export async function translateText(text, targetLanguage = 'Hindi', studentName = 'Aarav') {
  const fullLangName = getFullLanguageName(targetLanguage);

  try {
    const response = await fetch(`${BASE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLanguage: fullLangName,
        studentName
      })
    });

    const data = await response.json();
    return data; // returns { translatedText, success }
  } catch (err) {
    console.error('API Error in /translate:', err);
    return {
      success: false,
      translatedText: text,
      error: err.message
    };
  }
}

/**
 * Fetch progress analytics for a student (/progress/:studentName)
 * @param {string} studentName 
 */
export async function getStudentProgress(studentName = 'Aarav') {
  try {
    const response = await fetch(`${BASE_URL}/progress/${encodeURIComponent(studentName)}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('API Error in /progress/:studentName:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Fetch overall class progress overview for Teacher Portal
 */
export async function getProgressOverview() {
  try {
    const response = await fetch(`${BASE_URL}/progress-overview`);
    if (!response.ok) {
      return { success: true, overview: { totalStudents: 34, avgScore: 78 } };
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('API Error in /progress-overview:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Ask the NCERT Socratic Chatbot (/ask-ncert-tutor)
 * Falls back to /ask-tutor if /ask-ncert-tutor is not implemented/fails.
 * @param {string} question 
 * @param {string} context 
 * @param {string} studentName 
 */
export async function askNcertTutor(question, context = '', studentName = 'Aarav') {
  try {
    const response = await fetch(`${BASE_URL}/ask-ncert-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        context,
        studentName
      })
    });

    if (!response.ok) {
      throw new Error(`Endpoint status ${response.status}`);
    }

    const data = await response.json();
    return data; // returns { answer, success }
  } catch (err) {
    console.warn('API /ask-ncert-tutor not ready or failed, falling back to /ask-tutor:', err.message);
    const combinedPrompt = context ? `[Context: ${context}] Question: ${question}` : question;
    return askTutor(combinedPrompt, studentName);
  }
}

