import React, { useState } from 'react';
import { askAiTutor } from '../api';

export default function AIMentorPage({ user }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Yahan hum user ka naam nikal rahe hain, agar login nahi hai toh "Student" default le rahe hain
  const studentName = user?.displayName || 'Student';

  const handleAskTutor = async (e) => {
    e.preventDefault(); 
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      // Backend (Kritika ki API) ko request bhej rahe hain
      const data = await askAiTutor(question, studentName);
      
      // Backend jo bhi answer dega wo screen par dikhayega
      setResponse(data.answer || data.message || JSON.stringify(data));
    } catch (err) {
      console.error("Mentor API Error:", err);
      setError("AI Tutor se connect karne mein problem hui. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Ask AI Mentor 🤖</h2>
        <p className="text-slate-500 mb-6">Apne coding doubts ya questions yahan poocho!</p>

        <form onSubmit={handleAskTutor} className="mb-6">
          <textarea
            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows="4"
            placeholder="Type your coding doubt here... (e.g., What is a linked list?)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-sm ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {response && (
          <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <span>💡</span> Mentor's Reply:
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}