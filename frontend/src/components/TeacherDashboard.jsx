import React from 'react';
import { 
  GraduationCap, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Download, 
  Hand, 
  CheckCircle2, 
  BookOpen,
  Search,
  Filter
} from 'lucide-react';
import jsPDF from 'jspdf';

export default function TeacherDashboard() {
  const classStats = {
    className: "Class 8B — Computer Science",
    totalStudents: 34,
    avgMastery: 78,
    islUsers: 14,
    weakTopicsCount: 3
  };

  const flaggedStudents = [
    { id: 1, name: "Aarav Sharma", rollNo: "04", weakTopic: "Nested Loops", score: "62%", status: "Needs Support", islMode: true },
    { id: 2, name: "Priya Patel", rollNo: "18", weakTopic: "Variable Scope", score: "58%", status: "Flagged", islMode: true },
    { id: 3, name: "Rahul Kumar", rollNo: "22", weakTopic: "List Indexing", score: "69%", status: "Improving", islMode: false },
    { id: 4, name: "Ananya Roy", rollNo: "07", weakTopic: "Conditional If-Else", score: "94%", status: "Mastered", islMode: false }
  ];

  const conceptBreakdown = [
    { concept: "Variables & Output", mastery: 92 },
    { concept: "Control Flow (If-Else)", mastery: 84 },
    { concept: "While & For Loops", mastery: 68 },
    { concept: "Lists & Data Structures", mastery: 62 }
  ];

  const handleExportTeacherReport = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(200, 75, 36);
    doc.text('CodeSeekho AI — Teacher Analytics Report', 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Class: ${classStats.className} | Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Students: ${classStats.totalStudents} | Average Mastery: ${classStats.avgMastery}%`, 20, 38);

    doc.setLineWidth(0.5);
    doc.line(20, 46, 190, 46);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Flagged Students Requiring Revision:', 20, 58);

    let y = 68;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    flaggedStudents.forEach(s => {
      doc.text(`- ${s.name} (Roll #${s.rollNo}): Weak Topic -> ${s.weakTopic} | Mastery: ${s.score}`, 25, y);
      y += 8;
    });

    doc.save(`CodeSeekho_Teacher_Class_Report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        marginBottom: '32px'
      }}>
        <div>
          <div className="pill-badge" style={{ marginBottom: '10px' }}>
            <GraduationCap size={14} />
            <span>Classroom Analytics & NEP 2020 Tracking</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Teacher Portal
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Track individual student progress, flagged weak concepts, and ISL engagement.
          </p>
        </div>

        <button
          onClick={handleExportTeacherReport}
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: '14px' }}
        >
          <Download size={16} />
          <span>Export Class Report PDF</span>
        </button>
      </div>

      {/* 4 Stat Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Active Class</span>
            <Users size={18} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800' }}>34 Students</div>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>Section 8B (CS Dept)</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Class Avg Mastery</span>
            <TrendingUp size={18} color="#16A34A" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#16A34A' }}>78%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>NCERT Syllabus Benchmarking</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>ISL Support Active</span>
            <Hand size={18} color="#D97706" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#D97706' }}>14 Students</div>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>Hearing-impaired ISL mode</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Flagged At-Risk</span>
            <AlertCircle size={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#DC2626' }}>3 Students</div>
          <div style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '4px' }}>Need revision intervention</div>
        </div>
      </div>

      {/* Main Grid: Student Table & Mastery Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '28px'
      }}>
        {/* Left Column: Student Progress Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
              Student Mastery Tracking
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="Search student..."
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-card)'
                }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Roll</th>
                  <th style={{ padding: '12px 16px' }}>Student Name</th>
                  <th style={{ padding: '12px 16px' }}>Weakest Concept</th>
                  <th style={{ padding: '12px 16px' }}>Score</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {flaggedStudents.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>{s.rollNo}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                      {s.name}
                      {s.islMode && <span style={{ marginLeft: '6px', fontSize: '11px' }}>🤟</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{s.weakTopic}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>{s.score}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: s.status === 'Needs Support' || s.status === 'Flagged' ? '#FEF2F2' : '#F0FDF4',
                        color: s.status === 'Needs Support' || s.status === 'Flagged' ? '#DC2626' : '#16A34A',
                        border: s.status === 'Needs Support' || s.status === 'Flagged' ? '1px solid #FCA5A5' : '1px solid #86EFAC'
                      }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Concept Mastery Breakdown */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>
            Concept-Level Class Breakdown
          </h3>

          <div className="card" style={{ padding: '24px' }}>
            {conceptBreakdown.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>{item.concept}</span>
                  <span style={{ color: item.mastery < 70 ? '#DC2626' : 'var(--accent)' }}>{item.mastery}%</span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.mastery}%`,
                    height: '100%',
                    backgroundColor: item.mastery < 70 ? '#DC2626' : 'var(--accent)',
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
              </div>
            ))}

            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginTop: '12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: '1.5'
            }}>
              💡 <strong>AI Recommendation for Teacher:</strong> Schedule a 15-minute revision on <em>While & For Loops</em> before starting Chapter 4.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
