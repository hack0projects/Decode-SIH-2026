import React, { useState } from 'react';
import { 
  BookOpen, 
  Hand, 
  Download, 
  Play, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import jsPDF from 'jspdf';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';

export default function NCERTSection({ setCurrentTab, setSelectedProject }) {
  const [selectedGrade, setSelectedGrade] = useState('8');
  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [activeConcept, setActiveConcept] = useState('');

  const ncertChapters = [
    {
      id: 'ch1',
      number: 'Chapter 1',
      title: 'Introduction to Python & Algorithmic Thinking',
      grade: '8',
      description: 'Understanding step-by-step algorithms, flowchart logic, and writing your very first print statement in Python.',
      topics: ['Algorithm vs Program', 'Python Interpreter', 'print() and input()'],
      islAvailable: true,
      pdfSize: '1.2 MB'
    },
    {
      id: 'ch2',
      number: 'Chapter 2',
      title: 'Variables, Data Types & Arithmetic Operators',
      grade: '8',
      description: 'Storing data in computer memory variables (Integers, Floats, Strings, Booleans) and performing arithmetic.',
      topics: ['Variables & Memory', 'Data Types (int, str, float)', 'Operators (+, -, *, /)'],
      islAvailable: true,
      pdfSize: '1.8 MB'
    },
    {
      id: 'ch3',
      number: 'Chapter 3',
      title: 'Control Flow: Conditionals & Loops',
      grade: '8',
      description: 'Making decisions with if-elif-else branches and repeating tasks efficiently using while loops and for loops.',
      topics: ['if-else Branching', 'while Loops', 'for Loop Iteration'],
      islAvailable: true,
      pdfSize: '2.4 MB'
    },
    {
      id: 'ch4',
      number: 'Chapter 4',
      title: 'Functions & Modular Code Design',
      grade: '9',
      description: 'Breaking large programs into reusable functions with parameters and return values.',
      topics: ['def Keyword', 'Function Arguments', 'Return Values'],
      islAvailable: true,
      pdfSize: '2.1 MB'
    },
    {
      id: 'ch5',
      number: 'Chapter 5',
      title: 'Data Structures: Lists & Dictionaries',
      grade: '10',
      description: 'Organizing complex datasets using ordered list arrays and key-value pair dictionaries.',
      topics: ['List Indexing', 'Dictionary Keys', 'Iterating Datasets'],
      islAvailable: true,
      pdfSize: '3.0 MB'
    }
  ];

  const filteredChapters = ncertChapters.filter(c => c.grade === selectedGrade || selectedGrade === 'all');

  const handleDownloadNcertNotes = (chap) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(200, 75, 36);
    doc.text(`NCERT Class ${chap.grade} CS — ${chap.number}`, 20, 20);

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(chap.title, 20, 30);

    doc.setLineWidth(0.5);
    doc.line(20, 36, 190, 36);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Summary: ${chap.description}`, 20, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('Key Topics Covered in Syllabus:', 20, 62);

    let y = 72;
    doc.setFont('helvetica', 'normal');
    chap.topics.forEach(t => {
      doc.text(`• ${t}`, 25, y);
      y += 8;
    });

    doc.save(`NCERT_Class${chap.grade}_CS_${chap.number.replace(' ', '_')}.pdf`);
  };

  const handlePlayIsl = (concept) => {
    setActiveConcept(concept);
    setIsIslModalOpen(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="pill-badge" style={{ marginBottom: '10px' }}>
          <BookOpen size={14} />
          <span>Official RAG Grounded Curriculum</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          NCERT & State Board CS Syllabus
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>
          All AI explanations, regional language translations, and ISL video clips are strictly grounded in official Indian school Computer Science textbooks.
        </p>
      </div>

      {/* Grade Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        backgroundColor: 'var(--bg-card)',
        padding: '6px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        width: 'fit-content'
      }}>
        {['8', '9', '10', 'all'].map((grade) => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: '700',
              backgroundColor: selectedGrade === grade ? 'var(--accent)' : 'transparent',
              color: selectedGrade === grade ? '#FFFFFF' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            {grade === 'all' ? 'All Grades' : `Class ${grade}`}
          </button>
        ))}
      </div>

      {/* Chapters Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredChapters.map((chap) => (
          <div key={chap.id} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)' }}>
                    {chap.number}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>•</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    Class {chap.grade} Computer Science
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
                  {chap.title}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handlePlayIsl(chap.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #FCD34D',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}
                >
                  <Hand size={14} color="#D97706" />
                  <span>ISL Video</span>
                </button>

                <button
                  onClick={() => handleDownloadNcertNotes(chap)}
                  className="btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '12px' }}
                >
                  <Download size={14} />
                  <span>Download Notes PDF</span>
                </button>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              {chap.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-faint)' }}>Topics:</span>
              {chap.topics.map((t, idx) => (
                <span key={idx} style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-light)'
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ISLVideoPlayerModal
        isOpen={isIslModalOpen}
        onClose={() => setIsIslModalOpen(false)}
        conceptName={activeConcept}
        signDescription="NCERT syllabus mapped ISL gesture video clip"
      />
    </div>
  );
}
