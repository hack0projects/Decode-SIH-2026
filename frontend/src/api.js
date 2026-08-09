const BASE_URL = 'https://decode-sih-2026.onrender.com';

// 1. Code Run karne ke liye
export const runStudentCode = async (code, language, studentName) => {
  const response = await fetch(`${BASE_URL}/run-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, studentName }),
  });
  if (!response.ok) throw new Error(`[run-code] Error: ${response.status} ${response.statusText}`);
  return await response.json();
};

// 2. AI Tutor se question poochna
export const askAiTutor = async (question, studentName) => {
  const response = await fetch(`${BASE_URL}/ask-tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, studentName }),
  });
  if (!response.ok) throw new Error(`[ask-tutor] Error: ${response.status} ${response.statusText}`);
  return await response.json();
};

// 3. Text Translate karne ke liye
export const translateContent = async (text, targetLanguage, studentName) => {
  const response = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLanguage, studentName }),
  });
  if (!response.ok) throw new Error(`[translate] Error: ${response.status} ${response.statusText}`);
  return await response.json();
};

// 4. Kisi ek student ki progress dekhne ke liye
export const getStudentProgress = async (studentName) => {
  const response = await fetch(`${BASE_URL}/progress/${studentName}`);
  if (!response.ok) throw new Error(`[progress] Error: ${response.status} ${response.statusText}`);
  return await response.json();
};

// 5. Teacher Overview Dashboard ke liye
export const getProgressOverview = async () => {
  const response = await fetch(`${BASE_URL}/progress-overview`);
  if (!response.ok) throw new Error(`[progress-overview] Error: ${response.status} ${response.statusText}`);
  return await response.json();
};