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
  Layers,
  ChevronRight,
  Atom,
  Beaker,
  Dna,
  Binary,
  Calculator,
  Cpu,
  BrainCircuit
} from 'lucide-react';
import jsPDF from 'jspdf';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';
import { askTutor } from '../services/api';

export default function NCERTSection({ setCurrentTab, setSelectedProject }) {
  const [selectedGrade, setSelectedGrade] = useState('8');
  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [activeConcept, setActiveConcept] = useState('');
  
  // STEM Summary state
  const [selectedStemBranch, setSelectedStemBranch] = useState('cs');
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

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
    },
    {
      id: 'ch6',
      number: 'Chapter 6',
      title: 'Computer System Organization',
      grade: '11',
      description: 'Introduction to computer hardware organization, CPU architecture, system memory, registers, and OS basics.',
      topics: ['CPU & Bus system', 'RAM & Cache Memory', 'Operating System Roles'],
      islAvailable: true,
      pdfSize: '2.5 MB'
    },
    {
      id: 'ch7',
      number: 'Chapter 7',
      title: 'Boolean Logic & Gate Circuit Design',
      grade: '11',
      description: 'Understanding logic gates (AND, OR, NOT, NAND, NOR, XOR), truth tables, and Boolean expressions.',
      topics: ['Logic Gates', 'Truth Tables', 'De Morgan Theorems'],
      islAvailable: true,
      pdfSize: '2.0 MB'
    },
    {
      id: 'ch8',
      number: 'Chapter 8',
      title: 'Data Structures: Stack & Queue',
      grade: '12',
      description: 'Advanced data structure concepts implementing Linear Stacks (LIFO) and Queues (FIFO) using Python Lists.',
      topics: ['Stack Push & Pop', 'Queue Enqueue & Dequeue', 'Applications of Stacks'],
      islAvailable: true,
      pdfSize: '3.2 MB'
    },
    {
      id: 'ch9',
      number: 'Chapter 9',
      title: 'Database Management Systems & SQL',
      grade: '12',
      description: 'Relational Database Concepts, Primary/Foreign keys, and querying data using Structured Query Language (SQL).',
      topics: ['DDL vs DML Commands', 'SELECT Queries with WHERE', 'JOIN Operations'],
      islAvailable: true,
      pdfSize: '3.8 MB'
    },
    {
      id: 'ch10',
      number: 'Chapter 10',
      title: 'Computer Networks & Internet Security',
      grade: '12',
      description: 'Structure of the internet, network topologies, TCP/IP stack, DNS system, and basic cybersecurity principles.',
      topics: ['Topologies (Star, Mesh)', 'IP Routing & DNS', 'Firewalls & Cyber Laws'],
      islAvailable: true,
      pdfSize: '2.8 MB'
    }
  ];

  // STEM branches information
  const stemBranches = {
    cs: {
      name: 'Computer Science',
      icon: <Binary size={16} />,
      topic: 'Algorithms & Computing Machines',
      content: 'Computer Science is the study of computation, information, and automation. It spans theoretical disciplines (such as algorithms, theory of computation, and information theory) to applied disciplines (including the design and implementation of hardware and software). This syllabus covers python programming, computational thinking, data systems, and web connectivity.',
      highlight: true
    },
    physics: {
      name: 'Physics',
      icon: <Atom size={16} />,
      topic: 'Mechanics, Electromagnetism & Quantum Theory',
      content: 'Physics is the natural science that studies matter, its fundamental constituents, its motion and behavior through space and time, and the related entities of energy and force. Key branches include Classical Mechanics, Optics, Thermodynamics, Electromagnetism, and Modern/Quantum Physics which explains subatomic behavior.'
    },
    chemistry: {
      name: 'Chemistry',
      icon: <Beaker size={16} />,
      topic: 'Organic Compounds, Periodic Table & Kinetics',
      content: 'Chemistry is the scientific study of the properties and behavior of matter. It is a physical science within the natural sciences that covers the chemical elements that make up matter and compounds composed of atoms, molecules, and ions: their composition, structure, properties, behavior, and the changes they undergo during a reaction with other substances.'
    },
    biology: {
      name: 'Biology',
      icon: <Dna size={16} />,
      topic: 'Cell Biology, Genetics & Human Anatomy',
      content: 'Biology is the scientific study of life. It is a natural science with a broad scope but has several unifying themes that tie it together as a single, coherent field. For instance, all organisms are made up of cells that process hereditary information encoded in genes, which can be transmitted to future generations.'
    },
    math: {
      name: 'Mathematics',
      icon: <Calculator size={16} />,
      topic: 'Calculus, Algebra, Geometry & Statistics',
      content: 'Mathematics is an area of knowledge that includes the topics of numbers, formulas and related structures, shapes and the spaces in which they are contained, and quantities and their changes. Main topics in High School include Algebra, Calculus, Differential Equations, Geometry, Trigonometry, and Probability/Statistics.'
    }
  };

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

  const generateAISummary = async (branchKey) => {
    const branch = stemBranches[branchKey];
    if (!branch) return;

    setIsSummarizing(true);
    setAiSummary('');

    const promptText = `Summarize this STEM topic in a simple, engaging, Socratic manner suitable for Class 8-12 students. Include 3 bullet points of real-world applications. Topic: ${branch.name} - Overview: ${branch.content}`;

    try {
      const response = await askTutor(promptText, 'Student');
      const text = response?.answer || response?.reply || response?.response || 'Failed to generate summary.';
      setAiSummary(text);
    } catch (err) {
      console.error('Error generating summary:', err);
      // Fallback summary
      setAiSummary(`AI Summary for ${branch.name}: \n\n${branch.content.substring(0, 150)}...\n\nApplications:\n1. Tech and modern industry design\n2. Logical problem solving\n3. Academic excellence.`);
    } finally {
      setIsSummarizing(false);
    }
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
          All AI explanations, regional language translations, and ISL video clips are strictly grounded in official Indian school textbooks.
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
        {['8', '9', '10', '11', '12', 'all'].map((grade) => (
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

      {/* Main Grid: Syllabus (Left) & STEM Menu (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '32px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Chapters List */}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

        {/* Right Side: STEM AI Summary Panel */}
        <div style={{
          position: 'sticky',
          top: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Menu Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrainCircuit size={20} color="var(--accent)" />
              <span>STEM Branches AI Lab</span>
            </h3>
            
            {/* Tabs List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(stemBranches).map(([key, branch]) => {
                const isSelected = selectedStemBranch === key;
                const isCS = branch.highlight;
                
                // Styles for active/inactive and CS highlight
                const getTabStyle = () => {
                  if (isCS) {
                    return {
                      border: isSelected ? '2px solid var(--accent)' : '1px dashed var(--accent)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : 'rgba(235, 94, 40, 0.05)',
                      color: 'var(--accent)',
                      fontWeight: '800',
                      boxShadow: '0 4px 12px rgba(235, 94, 40, 0.1)'
                    };
                  }
                  return {
                    border: isSelected ? '1px solid var(--border-medium)' : '1px solid var(--border-light)',
                    backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
                    color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: isSelected ? '700' : '500'
                  };
                };

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedStemBranch(key);
                      setAiSummary('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      ...getTabStyle()
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {branch.icon}
                      <span>{branch.name}</span>
                    </div>
                    {isCS && <span style={{
                      fontSize: '9px',
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                      fontWeight: '900',
                      letterSpacing: '0.5px'
                    }}>Curriculum</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive AI Summarizer Display Card */}
          {selectedStemBranch && (
            <div className="card" style={{ 
              padding: '24px', 
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={16} color="var(--accent)" />
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {stemBranches[selectedStemBranch].name} Details
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                {stemBranches[selectedStemBranch].content}
              </p>

              {aiSummary ? (
                <div style={{
                  backgroundColor: 'var(--bg-card)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: 'var(--text-main)',
                  marginTop: '12px'
                }}>
                  <div style={{ fontWeight: '700', color: 'var(--accent)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BrainCircuit size={14} />
                    <span>AI Socratic Summary</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-line' }}>{aiSummary}</div>
                </div>
              ) : (
                <button
                  onClick={() => generateAISummary(selectedStemBranch)}
                  disabled={isSummarizing}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '8px'
                  }}
                >
                  {isSummarizing ? (
                    <>
                      <div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      <span>Summarizing Topic...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Summarize with AI Mentor</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
        
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
