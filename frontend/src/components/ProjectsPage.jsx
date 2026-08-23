import React from 'react';
import { 
  FolderKanban, 
  Code2, 
  Hand, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Blocks,
  Terminal
} from 'lucide-react';

export default function ProjectsPage({ setCurrentTab, setSelectedProject }) {
  const projectsList = [
    {
      id: 'calculator',
      title: 'Smart Calculator',
      description: 'Build a CLI & GUI calculator with arithmetic functions, loop repetitions, and division-by-zero error handling.',
      language: 'Python',
      editorSupport: 'Dual (Blockly + Python)',
      ncertChapter: 'NCERT Class 8 · Chapter 2 & 3',
      difficulty: 'Beginner',
      estimatedTime: '25 mins',
      islSupported: true,
      tags: ['Variables', 'Control Flow', 'Functions'],
      emoji: '🧮',
      codeSnippet: `def add(a, b):\n    return a + b\n\nprint("Result:", add(15, 25))`
    },
    {
      id: 'quiz',
      title: 'Interactive Quiz App',
      description: 'Create a multiple-choice CS quiz app using lists and dictionaries to track scores and give instant feedback.',
      language: 'Python',
      editorSupport: 'Dual (Blockly + Python)',
      ncertChapter: 'NCERT Class 8/9 · Data Structures',
      difficulty: 'Beginner',
      estimatedTime: '35 mins',
      islSupported: true,
      tags: ['Lists', 'Dictionaries', 'For Loops'],
      emoji: '❓',
      codeSnippet: `questions = {"What is RAM?": "Memory"}\nfor q, a in questions.items():\n    print(q)`
    },
    {
      id: 'tictactoe',
      title: 'Tic-Tac-Toe Game',
      description: 'Design a two-player 3x3 grid game with winning condition validation logic and turn counters.',
      language: 'Python / JS',
      editorSupport: 'Monaco Text Editor',
      ncertChapter: 'NCERT Class 9/10 · 2D Arrays & Logic',
      difficulty: 'Intermediate',
      estimatedTime: '45 mins',
      islSupported: true,
      tags: ['2D Arrays', 'Nested Loops', 'Game State'],
      emoji: '❌⭕',
      codeSnippet: `board = [[" ", " ", " "], [" ", " ", " "], [" ", " ", " "]]\ndef check_win(board):\n    pass`
    },
    {
      id: 'portfolio',
      title: 'Student Portfolio Website',
      description: 'Create your very own personal web page showcasing your coding achievements, bio, and ISL badges.',
      language: 'HTML & CSS',
      editorSupport: 'Live Web Editor',
      ncertChapter: 'NCERT Class 8/9 · Web Basics',
      difficulty: 'Beginner',
      estimatedTime: '30 mins',
      islSupported: true,
      tags: ['HTML5', 'CSS Flexbox', 'Accessibility'],
      emoji: '🌐',
      codeSnippet: `<h1>Aarav's Coding Portfolio</h1>\n<p>Learned Python with CodeSeekho AI!</p>`
    },
    {
      id: 'minigame',
      title: 'Mini Dodge Game',
      description: 'Program a block-based mini game where player avatar dodges obstacles using arrow key events.',
      language: 'Blockly / JS',
      editorSupport: 'Blockly Visual Blocks',
      ncertChapter: 'NCERT Class 8 · Event Handling',
      difficulty: 'Beginner',
      estimatedTime: '30 mins',
      islSupported: true,
      tags: ['Events', 'Game Loop', 'Variables'],
      emoji: '🎮',
      codeSnippet: `when_key_pressed("ArrowLeft", move_left)`
    }
  ];

  const handleLaunchProject = (proj) => {
    setSelectedProject(proj);
    setCurrentTab('my-workspace');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="pill-badge" style={{ marginBottom: '12px' }}>
          <FolderKanban size={14} />
          <span>Project-Based Learning Method</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Hands-On Mini Projects
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '700px' }}>
          Inspired by WhiteHat Jr's "build something visible, get instant feedback" model. Every project comes with ISL video clips, NCERT syllabus alignment, and dual visual/code editing.
        </p>
      </div>

      {/* Projects List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {projectsList.map((proj) => (
          <div 
            key={proj.id}
            className="card"
            style={{
              padding: '28px',
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '24px',
              alignItems: 'center'
            }}
          >
            {/* Left side details */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '32px' }}>{proj.emoji}</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {proj.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '2px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--accent)' }}>{proj.language}</span>
                    <span style={{ color: 'var(--text-faint)' }}>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>{proj.difficulty}</span>
                    <span style={{ color: 'var(--text-faint)' }}>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>⏱ {proj.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                {proj.description}
              </p>

              {/* Tags & NCERT alignment */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-light)'
                }}>
                  <BookOpen size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  {proj.ncertChapter}
                </span>

                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FCD34D'
                }}>
                  🤟 ISL Video Available
                </span>

                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)'
                }}>
                  <Blocks size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  {proj.editorSupport}
                </span>
              </div>

              <button
                onClick={() => handleLaunchProject(proj)}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <Play size={14} fill="currentColor" />
                <span>Launch Project Workspace</span>
              </button>
            </div>

            {/* Right side Code Preview Box */}
            <div style={{
              backgroundColor: '#1E1E1E',
              color: '#D4D4D4',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              border: '1px solid #333333',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                paddingBottom: '8px',
                borderBottom: '1px solid #333333',
                marginBottom: '12px',
                color: '#888888',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={12} />
                  <span>main.py</span>
                </div>
                <span>Preview</span>
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                <code>{proj.codeSnippet}</code>
              </pre>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
