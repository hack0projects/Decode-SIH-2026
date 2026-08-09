import React, { useState } from 'react';
import { 
  Bot, 
  Languages, 
  Hand, 
  Send, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Code2, 
  CheckCircle2,
  Volume2
} from 'lucide-react';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';
import { askTutor, translateText } from '../services/api';

export default function AIMentorPage({ currentLang, islMode }) {
  const [selectedLang, setSelectedLang] = useState(currentLang || 'hi');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am your CodeSeekho AI Mentor. I help Class 8+ students understand programming concepts in plain regional languages without spoiling answers with direct code dumps. How can I help you today?',
      islAvailable: true,
      concept: 'Introduction'
    }
  ]);

  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [activeIslConcept, setActiveIslConcept] = useState('');

  const sampleQuestions = [
    "What is the difference between a for loop and a while loop?",
    "Why do I get 'IndexError: list index out of range'?",
    "How does a variable store data in computer memory?",
    "Explain functions using a simple recipe analogy."
  ];

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');

    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    let conceptLabel = userText.toLowerCase().includes('loop') ? 'Loop Iteration' : userText.toLowerCase().includes('error') ? 'Error Debugging' : 'CS Concepts';

    try {
      const res = await askTutor(userText, 'Aarav');
      let replyText = res?.reply || res?.response || res?.answer;

      if (!replyText || res?.error) {
        // Fallback with live translation
        let baseEn = 'Programming concepts are best understood by practicing small examples!';
        if (userText.toLowerCase().includes('loop')) {
          baseEn = 'A loop repeats instructions until a condition turns false, like running laps around a track.';
        } else if (userText.toLowerCase().includes('error')) {
          baseEn = 'Syntax errors happen when instructions are incomplete. Check for missing quotes or parentheses.';
        }
        
        if (selectedLang !== 'en') {
          const trans = await translateText(baseEn, selectedLang, 'Aarav');
          replyText = trans?.translatedText || baseEn;
        } else {
          replyText = baseEn;
        }
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: replyText,
        islAvailable: true,
        concept: conceptLabel
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'लूप (Loop) का मतलब है किसी काम को बार-बार दोहराना। सोचिए जब आप मैदान के चक्कर लगाते हैं: शर्त पूरी होने तक गिनती चलती रहती है।',
        islAvailable: true,
        concept: conceptLabel
      }]);
    }
  };

  const triggerIslModal = (concept) => {
    setActiveIslConcept(concept);
    setIsIslModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        marginBottom: '28px'
      }}>
        <div>
          <div className="pill-badge" style={{ marginBottom: '10px' }}>
            <Bot size={14} />
            <span>Socratic Learning Pipeline</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            AI Coding Mentor Lab
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Answers grounded in NCERT Computer Science curriculum without direct code dumps.
          </p>
        </div>

        {/* Regional Language Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-card)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)'
        }}>
          <Languages size={18} color="var(--accent)" />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>AI Language:</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            style={{
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              color: 'var(--accent)',
              cursor: 'pointer'
            }}
          >
            <option value="hi">हिंदी (Hindi)</option>
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
          </select>
        </div>
      </div>

      {/* Suggested Quick Questions Pills */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-faint)', marginBottom: '10px' }}>
          Suggested Questions based on your recent NCERT lessons:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInputQuery(q);
              }}
              style={{
                fontSize: '13px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              💡 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        padding: '0',
        overflow: 'hidden'
      }}>
        {/* Messages List */}
        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '480px',
          overflowY: 'auto'
        }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: m.role === 'user' ? 'var(--accent)' : 'var(--bg-subtle)',
                color: m.role === 'user' ? '#FFFFFF' : 'var(--text-main)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                lineHeight: '1.6',
                border: m.role === 'user' ? '1px solid var(--accent)' : '1px solid var(--border-light)'
              }}
            >
              <div>{m.text}</div>

              {/* ISL Video Available Pill inside message */}
              {m.islAvailable && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>
                    Mapped NCERT Concept: <strong>{m.concept}</strong>
                  </span>
                  <button
                    onClick={() => triggerIslModal(m.concept)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#D97706',
                      backgroundColor: '#FEF3C7',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #FCD34D'
                    }}
                  >
                    <Hand size={14} />
                    <span>Watch ISL Sign Video</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            className="form-input"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your question or paste code error here..."
            style={{ fontSize: '14px' }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
          >
            <Send size={16} />
            <span>Ask Mentor</span>
          </button>
        </form>
      </div>

      {/* ISL Player Modal */}
      <ISLVideoPlayerModal
        isOpen={isIslModalOpen}
        onClose={() => setIsIslModalOpen(false)}
        conceptName={activeIslConcept}
        signDescription="Sign language gesture explanation for programming logic"
      />
    </div>
  );
}
