import React, { useState } from 'react';
import { runStudentCode } from '../api';

export default function MyProjectsWorkspace({ user }) {
  const [code, setCode] = useState('// Write your code here...\nconsole.log("Hello, CodeSeekho AI!");');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // User ka naam API me bhejne ke liye
  const studentName = user?.displayName || 'Student';

  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError(null);
    setOutput('Running code on server...');

    try {
      // Backend (Kritika ki API) par code bhej rahe hain
      const data = await runStudentCode(code, language, studentName);
      
      // Assume kar rahe hain Kritika ka backend { output: "result text" } bhej raha hai
      setOutput(data.output || data.result || JSON.stringify(data));
    } catch (err) {
      console.error("Code Run Error:", err);
      setError("Code run karne mein error aaya. API ya server check karo.");
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Code Workspace 💻</h2>
          
          {/* Language Selector */}
          <select 
            className="p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Area */}
          <div className="flex flex-col gap-4">
            <textarea
              className="w-full h-80 p-4 font-mono text-sm bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
            ></textarea>
            
            <button
              onClick={handleRunCode}
              disabled={loading}
              className={`py-3 rounded-xl font-semibold text-white transition-all shadow-sm ${
                loading ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? 'Executing...' : 'Run Code ▶'}
            </button>
          </div>

          {/* Output Area */}
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Output / Terminal</h3>
            <div className="w-full flex-grow p-4 font-mono text-sm bg-slate-50 border border-slate-300 rounded-xl overflow-auto whitespace-pre-wrap">
              {error ? (
                <span className="text-red-600">{error}</span>
              ) : output ? (
                <span className="text-slate-800">{output}</span>
              ) : (
                <span className="text-slate-400 italic">Code output will appear here...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}