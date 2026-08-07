import React from 'react';
import { 
  Flame, 
  Trophy, 
  Clock, 
  ArrowRight, 
  Hand, 
  BookOpen, 
  Play, 
  CheckCircle, 
  HelpCircle, 
  Sparkles,
  Code2,
  Brain
} from 'lucide-react';

export default function HomeDashboard({ setCurrentTab, islMode, currentLang }) {
  const currentLesson = {
    title: "Chapter 3: Control Flow & Loops in Python",
    ncertCode: "NCERT Class 8 CS · Unit 2",
    progress: 65,
    currentStep: "Building a Repeat Calculator Loop",
    islAvailable: true
  };

  const recentProjects = [
    { id: 'calc', name: 'Smart Calculator', status: 'In Progress', lang: 'Python', progress: 80, icon: '🧮' },
    { id: 'quiz', name: 'Interactive Quiz App', status: 'Next Up', lang: 'Python', progress: 0, icon: '❓' },
    { id: 'tictactoe', name: 'Tic-Tac-Toe Game', status: 'Locked', lang: 'Python', progress: 0, icon: '❌' },
  ];

  const weakConcepts = [
    { title: "Nested For Loops", status: "Needs Practice", ncertChapter: "NCERT Ch 3.2" },
    { title: "Variable Scope", status: "Mastered", ncertChapter: "NCERT Ch 2.4" }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Top ISL Banner if active */}
      {islMode && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: 'var(--radius-md)',
          padding: '14px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: '20px',
          width: '100%',
          boxSizing: 'border-box',
          color: '#92400E'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div style={{
              backgroundColor: '#F59E0B',
              color: '#FFFFFF',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}>
              <Hand size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>
                Indian Sign Language (ISL) Mode is Active
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                All lesson concept cards & error messages will include pop-up ISL video clips.
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('my-workspace')}
            style={{
              backgroundColor: '#B45309',
              color: '#FFFFFF',
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              marginLeft: 'auto',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            Launch ISL Workspace →
          </button>
        </div>
      )}

      {/* Student Welcome Header & Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        gap: '24px',
        marginBottom: '32px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0, color: 'var(--text-main)' }}>
            Namaste, Aarav 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Class 8B · CodeSeekho AI Student Dashboard · Language: <strong style={{ textTransform: 'uppercase', color: 'var(--accent)' }}>{currentLang}</strong>
          </p>
        </div>

        {/* Gamified Streak & Points Cards (Aligned Far Right) */}
        <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-medium)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Flame size={24} color="var(--accent)" />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent)', lineHeight: 1.1 }}>7 Days</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '2px' }}>Daily Streak</div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-medium)',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Trophy size={24} color="#D97706" />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#D97706', lineHeight: 1.1 }}>450 XP</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginTop: '2px' }}>Mastery Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Continue Learning Card */}
      <div className="card" style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        padding: '32px',
        marginBottom: '36px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <span className="pill-badge">
                <BookOpen size={12} />
                {currentLesson.ncertCode}
              </span>
              {currentLesson.islAvailable && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#92400E',
                  backgroundColor: '#FEF3C7',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  🤟 ISL Video Available
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              {currentLesson.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Current Step: <strong>{currentLesson.currentStep}</strong>
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('my-workspace')}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <Play size={16} fill="currentColor" />
            <span>Continue Building</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ margin: '20px 0 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
            <span>Module Completion</span>
            <span>{currentLesson.progress}% Complete</span>
          </div>
          <div style={{
            height: '10px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${currentLesson.progress}%`,
              height: '100%',
              backgroundColor: 'var(--accent)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Grid: Recommended Projects & NCERT Weak Concepts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '28px'
      }}>
        {/* Left Column: Hands-On Mini-Projects */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
              Your Project Workspaces
            </h3>
            <button 
              onClick={() => setCurrentTab('projects')}
              style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)' }}
            >
              View All Projects →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentProjects.map(proj => (
              <div 
                key={proj.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentTab('my-workspace')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '28px' }}>{proj.icon}</span>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{proj.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Language: {proj.lang} · Progress: {proj.progress}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: proj.progress > 0 ? 'var(--accent-light)' : 'var(--bg-subtle)',
                    color: proj.progress > 0 ? 'var(--accent)' : 'var(--text-muted)'
                  }}>
                    {proj.status}
                  </span>
                  <ArrowRight size={16} color="var(--text-faint)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Spaced Revision & NCERT Alignment */}
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
              Spaced Memory & Revision
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              AI detected topics to practice today based on past errors:
            </p>
          </div>

          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            {weakConcepts.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  paddingBottom: idx !== weakConcepts.length - 1 ? '14px' : '0',
                  marginBottom: idx !== weakConcepts.length - 1 ? '14px' : '0',
                  borderBottom: idx !== weakConcepts.length - 1 ? '1px solid var(--border-light)' : 'none',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{item.ncertChapter}</div>
                </div>

                <button
                  onClick={() => setCurrentTab('ai-mentor')}
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: item.status === 'Needs Practice' ? 'var(--accent)' : 'var(--text-muted)',
                    backgroundColor: item.status === 'Needs Practice' ? 'var(--accent-light)' : 'var(--bg-subtle)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  {item.status === 'Needs Practice' ? 'Revise with AI Tutor' : 'Mastered ✓'}
                </button>
              </div>
            ))}
          </div>

          {/* Quick AI Tutor Ask Box */}
          <div className="card" style={{ backgroundColor: 'var(--bg-subtle)', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>
              <Brain size={16} color="var(--accent)" />
              <span>Ask AI Coding Mentor</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Stuck on a concept or code error? Ask in plain Hindi, Tamil or English without code dumps.
            </p>
            <button
              onClick={() => setCurrentTab('ai-mentor')}
              className="btn-secondary"
              style={{ width: '100%', padding: '8px', fontSize: '13px' }}
            >
              Open AI Mentor Drawer
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
