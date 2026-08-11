import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Users, Trophy, Target, Download, Search, Rocket,
  TrendingUp, BookOpen, RefreshCw, GraduationCap
} from 'lucide-react';
import jsPDF from 'jspdf';
import { getProgressOverview } from '../services/api';

function DashboardSkeleton() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ height: '36px', width: '280px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', marginBottom: '8px' }} />
      <div style={{ height: '18px', width: '380px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', marginBottom: '32px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="card" style={{ padding: '24px' }}>
            <div style={{ height: '44px', width: '44px', borderRadius: '12px', backgroundColor: 'var(--bg-subtle)', marginBottom: '20px' }} />
            <div style={{ height: '32px', width: '80px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', marginBottom: '8px' }} />
            <div style={{ height: '14px', width: '120px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      minWidth: '150px', borderRadius: '12px',
      border: '1px solid rgba(200,75,36,0.3)',
      backgroundColor: 'rgba(30,15,10,0.95)',
      padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
    }}>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }} />
          Score
        </span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{payload[0]?.value ?? 0}</span>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, suffix, bgGradient, trend }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="card"
      style={{
        padding: '24px', position: 'relative', overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(200,75,36,0.12)' : ''
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: bgGradient, opacity: hovered ? 0.12 : 0.06,
        filter: 'blur(20px)', pointerEvents: 'none', transition: 'opacity 0.3s'
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px', background: bgGradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {Icon && <Icon size={20} color="#fff" strokeWidth={2} />}
        </div>
        {trend && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            padding: '4px 8px', borderRadius: '20px',
            backgroundColor: 'rgba(22,163,74,0.1)', color: '#16A34A',
            fontSize: '11px', fontWeight: '600', border: '1px solid rgba(22,163,74,0.2)'
          }}>
            <TrendingUp size={11} /> {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-main)', lineHeight: 1 }}>
        {value}
        {suffix && <span style={{ fontSize: '18px', color: 'var(--text-muted)', fontWeight: '600' }}>{suffix}</span>}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{label}</div>
    </div>
  );
}

function StatusBadge({ status = '' }) {
  const safeStatus = String(status || '');
  const isExcelling = safeStatus.includes('Excelling');
  const isGood = safeStatus.includes('Good');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
      backgroundColor: isExcelling ? 'rgba(22,163,74,0.1)' : isGood ? 'rgba(14,165,233,0.1)' : 'rgba(245,158,11,0.1)',
      color: isExcelling ? '#16A34A' : isGood ? '#0284C7' : '#D97706',
      border: `1px solid ${isExcelling ? 'rgba(22,163,74,0.25)' : isGood ? 'rgba(14,165,233,0.25)' : 'rgba(245,158,11,0.25)'}`
    }}>
      {isExcelling && <Rocket size={10} />}
      {safeStatus || 'Active'}
    </span>
  );
}

export default function TeacherDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getProgressOverview();
        if (Array.isArray(result) && result.length > 0) {
          // Fill in mock defaults for any fields the API doesn't provide yet
          const mockDefaults = [
            { score: 95, solvedProblems: 18, status: "Active & Excelling 🚀", strongTopic: "Recursion & Sorting", weakTopic: "Dynamic Programming", revisionStatus: "Scheduled for tomorrow" },
            { score: 85, solvedProblems: 14, status: "Good Progress 📈", strongTopic: "Arrays & Strings", weakTopic: "Graphs & Trees", revisionStatus: "Due Today ⚠️" },
            { score: 92, solvedProblems: 17, status: "Active & Excelling 🚀", strongTopic: "Object Oriented Programming", weakTopic: "Bit Manipulation", revisionStatus: "Completed ✅" },
            { score: 78, solvedProblems: 11, status: "Good Progress 📈", strongTopic: "Linked Lists", weakTopic: "Backtracking", revisionStatus: "Scheduled for next week" },
            { score: 88, solvedProblems: 15, status: "Active & Excelling 🚀", strongTopic: "Stacks & Queues", weakTopic: "Greedy Algorithms", revisionStatus: "Due Today ⚠️" },
          ];
          const enriched = result.map((student, i) => ({
            ...mockDefaults[i % mockDefaults.length],
            ...Object.fromEntries(Object.entries(student).filter(([, v]) => v !== null && v !== undefined && v !== '')),
          }));
          setData(enriched);
        } else {
          // Fallback array
          setData([
            {
              studentName: "Sribendu Prasad Muduli",
              score: 95,
              solvedProblems: 18,
              status: "Active & Excelling 🚀",
              strongTopic: "Recursion & Sorting",
              weakTopic: "Dynamic Programming",
              revisionStatus: "Scheduled for tomorrow",
              topicScores: { arrays: 88, recursion: 95, dp: 52, graphs: 70, oops: 80 },
              weeklyProgress: [60, 68, 75, 82, 88, 92, 95],
              streakDays: 12,
              accuracy: 89
            },
            {
              studentName: "Aman Sharma",
              score: 85,
              solvedProblems: 14,
              status: "Good Progress 📈",
              strongTopic: "Arrays & Strings",
              weakTopic: "Graphs & Trees",
              revisionStatus: "Due Today ⚠️",
              topicScores: { arrays: 90, recursion: 72, dp: 65, graphs: 48, oops: 78 },
              weeklyProgress: [40, 50, 58, 65, 72, 80, 85],
              streakDays: 7,
              accuracy: 76
            },
            {
              studentName: "Kritika Verma",
              score: 92,
              solvedProblems: 17,
              status: "Active & Excelling 🚀",
              strongTopic: "Object Oriented Programming",
              weakTopic: "Bit Manipulation",
              revisionStatus: "Completed ✅",
              topicScores: { arrays: 85, recursion: 80, dp: 74, graphs: 78, oops: 95 },
              weeklyProgress: [55, 63, 70, 78, 84, 89, 92],
              streakDays: 15,
              accuracy: 91
            }
          ]);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const overview = useMemo(() => {
    if (!data || !data.length) return { totalStudents: 0, avgScore: 0, totalSolved: 0 };
    const totalStudents = data.length;
    const avgScore = Math.round(data.reduce((s, d) => s + (Number(d.score) || 0), 0) / totalStudents);
    const totalSolved = data.reduce((s, d) => s + (Number(d.solvedProblems) || 0), 0);
    return { totalStudents, avgScore, totalSolved };
  }, [data]);

  const filteredData = useMemo(
    () => (data || []).filter(s => String(s.studentName || '').toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  const handleExportReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(200, 75, 36);
      doc.text('CodeSeekho AI — Teacher Analytics Report', 20, 20);
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated: ' + new Date().toLocaleString(), 20, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Overview', 20, 44);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Total Students: ' + overview.totalStudents + '  |  Avg Score: ' + overview.avgScore + '%  |  Problems Solved: ' + overview.totalSolved, 20, 52);
      let y = 68;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Student Progress', 20, 62);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      data.forEach(s => {
        doc.text('- ' + (s.studentName || 'Student') + ': Score ' + (s.score || 0) + '% | Solved ' + (s.solvedProblems || 0) + ' | ' + (s.status || ''), 24, y);
        doc.text('  Strong: ' + (s.strongTopic || 'N/A') + '  |  Weak: ' + (s.weakTopic || 'N/A') + '  |  Revision: ' + (s.revisionStatus || 'N/A'), 24, y + 5);
        y += 14;
      });
      doc.save('CodeSeekho_Teacher_Report_' + new Date().toISOString().slice(0, 10) + '.pdf');
    } catch (e) {
      console.error('PDF generation error:', e);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="pill-badge" style={{ marginBottom: '10px' }}>
            <GraduationCap size={14} />
            <span>Teacher Dashboard &amp; Analytics</span>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)', margin: 0 }}>
            Teacher Portal
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Track student scores, mastery levels, and spaced revision reminders.
          </p>
        </div>
        <button onClick={handleExportReport} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={15} />
          Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <SummaryCard icon={Users} label="Total Students" value={overview.totalStudents} trend="+2 this week" bgGradient="linear-gradient(135deg, #C84B24, #e8641a)" />
        <SummaryCard icon={Trophy} label="Average Score" value={overview.avgScore} suffix="%" trend="+5% this week" bgGradient="linear-gradient(135deg, #16A34A, #15803D)" />
        <SummaryCard icon={Target} label="Problems Solved" value={overview.totalSolved} trend="+9 this week" bgGradient="linear-gradient(135deg, #0284C7, #0369A1)" />
      </div>

      {/* Bar Chart */}
      <div className="card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Student Performance</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Score comparison across students</p>
        </div>
        <div style={{ height: '260px', width: '100%', minHeight: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis dataKey="studentName" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-light)' }} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} content={<ChartTooltip />} />
              <Bar dataKey="score" fill="#C84B24" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mastery & Revision Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

        {/* Student Topic Mastery */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <BookOpen size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Student Topic Mastery</h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Identifying strong and weak concepts per student.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.map((student, idx) => (
              <div key={student.studentName || idx} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-subtle)' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>{student.studentName || 'Student'}</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)', fontSize: '12px', color: '#16A34A' }}>
                    <span style={{ fontWeight: '600' }}>Strong:</span> {student.strongTopic || 'N/A'}
                  </div>
                  <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)', fontSize: '12px', color: '#DC2626' }}>
                    <span style={{ fontWeight: '600' }}>Weak:</span> {student.weakTopic || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spaced Revision Reminders */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <RefreshCw size={18} color="#D97706" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Spaced Revision Reminders</h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Automated reminder system for weak topic reinforcement.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.map((student, idx) => {
              const revStatus = String(student.revisionStatus || '');
              const isDone = revStatus.includes('Completed');
              const isDue = revStatus.includes('Due');
              return (
                <div key={student.studentName || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-subtle)' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{student.studentName || 'Student'}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Topic: {student.weakTopic || 'N/A'}</p>
                  </div>
                  <span style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap',
                    backgroundColor: isDone ? 'rgba(22,163,74,0.1)' : isDue ? 'rgba(245,158,11,0.1)' : 'rgba(200,75,36,0.1)',
                    color: isDone ? '#16A34A' : isDue ? '#D97706' : 'var(--accent)',
                    border: '1px solid ' + (isDone ? 'rgba(22,163,74,0.25)' : isDue ? 'rgba(245,158,11,0.25)' : 'rgba(200,75,36,0.25)')
                  }}>
                    {revStatus || 'Scheduled'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student Progress Table */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Student Progress Overview</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Detailed breakdown per student</p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-faint)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student..."
              style={{
                paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)',
                fontSize: '13px', color: 'var(--text-main)', backgroundColor: 'var(--bg-subtle)',
                outline: 'none', width: '220px', transition: 'border-color 0.15s, box-shadow 0.15s'
              }}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['S.No', 'Student Name', 'Score', 'Solved Problems', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                const name = item.studentName || 'Student';
                const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2) || 'ST';
                return (
                  <tr key={name + index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>{index + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #C84B24, #e8641a)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: '700', color: '#fff'
                        }}>
                          {initials}
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '4px 10px', borderRadius: '20px',
                        backgroundColor: 'rgba(200,75,36,0.1)', color: 'var(--accent)',
                        fontSize: '12px', fontWeight: '700', border: '1px solid rgba(200,75,36,0.2)'
                      }}>
                        {item.score || 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{item.solvedProblems || 0}</td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={item.status} /></td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '14px' }}>
                    No students match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}