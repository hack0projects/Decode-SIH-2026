import React, { useState } from 'react';
import { 
  Languages, 
  Hand, 
  Code2, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  Play,
  ShieldCheck
} from 'lucide-react';

export default function LandingPage({ setCurrentTab, setIslMode, islMode }) {
  const [activeRoleTab, setActiveRoleTab] = useState('student');
  const [email, setEmail] = useState('student@school.edu.in');
  const [password, setPassword] = useState('••••••••');
  const [localIsl, setLocalIsl] = useState(islMode);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIslMode(localIsl);
    if (activeRoleTab === 'student') {
      setCurrentTab('home');
    } else {
      setCurrentTab('teacher');
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Top Banner Notice */}
      <div style={{
        maxWidth: '1200px',
        margin: '24px auto 0',
        padding: '0 24px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-light)',
          border: '1px solid var(--accent-border)',
          color: 'var(--accent)',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <Sparkles size={14} />
          <span>AI coding mentor · ISL · 8 Indian Languages</span>
        </div>
      </div>

      {/* Main Hero Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '20px auto 0',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: '48px',
        alignItems: 'start'
      }}>
        {/* Left Column: Heading & USP cards */}
        <div>
          <h1 style={{
            fontSize: '52px',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: '-1.5px',
            color: 'var(--text-main)',
            marginBottom: '20px'
          }}>
            Learn to code in <span style={{ color: 'var(--accent)' }}>your language</span>, and in <span style={{ color: 'var(--accent)' }}>sign</span>.
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            marginBottom: '36px',
            maxWidth: '580px'
          }}>
            CodeSeekho AI teaches Class 8+ students real programming through small projects — with regional-language explanations and Indian Sign Language support inside every lesson.
          </p>

          {/* 4 USP Feature Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {/* Card 1 */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: 'var(--accent)',
                marginBottom: '12px'
              }}>
                <Languages size={20} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
                Your language, not just English
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Explanations grounded in the official NCERT / state-board CS syllabus, delivered in Indian languages.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: 'var(--accent)',
                marginBottom: '12px'
              }}>
                <Hand size={20} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
                Indian Sign Language built in
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Every core concept is mapped to an ISL clip inside the lesson — not bolted on afterwards.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: 'var(--accent)',
                marginBottom: '12px'
              }}>
                <Code2 size={20} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
                Real languages, real projects
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Students build Python & JS mini-projects like Calculators, Quiz Apps & Tic-Tac-Toe instead of memorizing syntax.
              </p>
            </div>

            {/* Card 4 */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: 'var(--accent)',
                marginBottom: '12px'
              }}>
                <GraduationCap size={20} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>
                Classroom ready
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Teacher dashboard tracks concept-level mastery and flags struggling students for NEP 2020 classrooms.
              </p>
            </div>
          </div>

          {/* Quick CTA button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setCurrentTab('home')}
              className="btn-primary" 
              style={{ padding: '14px 28px', fontSize: '16px' }}
            >
              <span>Explore Student Dashboard</span>
              <ArrowRight size={18} />
            </button>

            <button 
              onClick={() => setCurrentTab('my-workspace')}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '15px' }}
            >
              <span>Try Code Workspace</span>
            </button>
          </div>
        </div>

        {/* Right Column: Login Card matching reference screenshot */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Student / Teacher Role Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '28px'
          }}>
            <button
              onClick={() => setActiveRoleTab('student')}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: activeRoleTab === 'student' ? 'var(--bg-card)' : 'transparent',
                color: activeRoleTab === 'student' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeRoleTab === 'student' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Student
            </button>
            <button
              onClick={() => setActiveRoleTab('teacher')}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: activeRoleTab === 'teacher' ? 'var(--bg-card)' : 'transparent',
                color: activeRoleTab === 'teacher' ? 'var(--text-main)' : 'var(--text-muted)',
                boxShadow: activeRoleTab === 'teacher' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Teacher
            </button>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Pick up where you left off in your coding project.
          </p>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Email address
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu.in"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-main)' }}>
                Password
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {/* Checkbox for ISL mode */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
            onClick={() => setLocalIsl(!localIsl)}
            >
              <input
                type="checkbox"
                checked={localIsl}
                onChange={(e) => setLocalIsl(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                🤟 Enable Indian Sign Language (ISL) mode
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              Log in as {activeRoleTab === 'student' ? 'student' : 'teacher'}
            </button>
          </form>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
            fontSize: '12px',
            color: 'var(--text-faint)'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
            <span>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }}></div>
          </div>

          <button
            onClick={() => {
              setIslMode(localIsl);
              setCurrentTab('home');
            }}
            className="btn-secondary"
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          >
            Continue with Google
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: 'var(--text-muted)'
          }}>
            New here? <span style={{ color: 'var(--accent)', fontWeight: '700', cursor: 'pointer' }}>Create an account</span>
          </div>
        </div>
      </div>

      {/* ISL & NCERT Highlights Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '80px auto 0',
        padding: '0 24px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div>
            <div className="pill-badge" style={{ marginBottom: '16px' }}>
              <Hand size={14} />
              <span>ISL Video Mapping Engine</span>
            </div>
            <h2 style={{ fontSize: '30px', fontWeight: '800', marginBottom: '14px' }}>
              Designed for Hearing-Impaired & Regional Students
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              India has over 1.8 million hearing-impaired youth. General STEM platforms neglect coding. CodeSeekho AI pairs every programming logic snippet with pre-recorded Indian Sign Language video explanations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <CheckCircle2 size={18} color="var(--accent)" />
                <span>Concept-matched ISL dictionary (Loops, Arrays, Conditions)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <CheckCircle2 size={18} color="var(--accent)" />
                <span>Plain-English error translator (No scary stack traces)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <CheckCircle2 size={18} color="var(--accent)" />
                <span>Downloadable offline PDF lesson sheets for remote schools</span>
              </div>
            </div>
          </div>

          {/* Interactive ISL Gesture Card */}
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              marginBottom: '16px'
            }}>
              <Hand size={36} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
              Interactive ISL Gesture Clip
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Concept: <code style={{ backgroundColor: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>while (count &lt; 5)</code>
            </p>
            <div style={{
              backgroundColor: '#000000',
              borderRadius: 'var(--radius-md)',
              height: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'center',
              color: '#FFFFFF',
              position: 'relative'
            }}>
              <Play size={36} style={{ marginBottom: '8px', cursor: 'pointer' }} />
              <span style={{ fontSize: '13px', opacity: 0.9 }}>Click to play ISL gesture explanation</span>
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '6px',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                🤟 Subtitle: "Repeat action while condition remains True"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
