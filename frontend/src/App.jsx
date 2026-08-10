import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import HomeDashboard from './components/HomeDashboard';
import ProjectsPage from './components/ProjectsPage';
import MyProjectsWorkspace from './components/MyProjectsWorkspace';
import AIMentorPage from './components/AIMentorPage';
import TeacherDashboard from './components/TeacherDashboard';
import NCERTSection from './components/NCERTSection';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [islMode, setIslMode] = useState(true);
  const [currentLang, setCurrentLang] = useState('hi');
  const [userRole, setUserRole] = useState('student');
  const [userName, setUserName] = useState(localStorage.getItem('codeseekho_username') || '');

  const [selectedProject, setSelectedProject] = useState({
    id: 'calculator',
    title: 'Smart Calculator',
    emoji: '🧮',
    codeSnippet: `# CodeSeekho AI — Smart Calculator Project
# Problem Statement: Calculate sum of numbers using a while loop

total = 0
count = 1

while count <= 5:
    total = total + count
    print(f"Step {count}: Current sum is {total}")
    count = count + 1

print("Final Total Sum:", total)
`
  });

  const handleSetTab = (tab) => {
    const activeUser = userName || localStorage.getItem('codeseekho_username');
    // Silently block tab navigation if not logged in
    if (!activeUser && tab !== 'landing') {
      return;
    }
    // Silently block students from teacher portal
    if (tab === 'teacher' && userRole !== 'teacher') {
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        islMode={islMode}
        setIslMode={setIslMode}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        userRole={userRole}
        setUserRole={setUserRole}
        userName={userName}
        setUserName={setUserName}
      />

      {/* Main Content Body */}
      <main className="main-content">
        {currentTab === 'landing' && (
          <LandingPage
            setCurrentTab={handleSetTab}
            islMode={islMode}
            setIslMode={setIslMode}
            setUserRole={setUserRole}
            setUserName={(name) => {
              setUserName(name);
              localStorage.setItem('codeseekho_username', name);
            }}
          />
        )}

        {currentTab === 'home' && (
          <HomeDashboard
            setCurrentTab={handleSetTab}
            islMode={islMode}
            currentLang={currentLang}
            userName={userName}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsPage
            setCurrentTab={handleSetTab}
            setSelectedProject={setSelectedProject}
          />
        )}

        {currentTab === 'my-workspace' && (
          <MyProjectsWorkspace
            selectedProject={selectedProject}
            islMode={islMode}
            currentLang={currentLang}
            userName={userName}
          />
        )}

        {currentTab === 'ai-mentor' && (
          <AIMentorPage
            currentLang={currentLang}
            islMode={islMode}
            userName={userName}
          />
        )}

        {currentTab === 'ncert' && (
          <NCERTSection
            setCurrentTab={handleSetTab}
            setSelectedProject={setSelectedProject}
          />
        )}

        {currentTab === 'teacher' && (
          <TeacherDashboard />
        )}
      </main>

      {/* Minimal Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>CodeSeekho AI</strong> — Inclusive CS Education Platform (Hackathon MVP)
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
            <span>NCERT CS Curriculum Aligned</span>
            <span>•</span>
            <span>Indian Sign Language (ISL) Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
