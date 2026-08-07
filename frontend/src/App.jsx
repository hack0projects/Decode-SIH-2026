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

  return (
    <div className="app-container">
      {/* Top Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        islMode={islMode}
        setIslMode={setIslMode}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Content Body */}
      <main className="main-content">
        {currentTab === 'landing' && (
          <LandingPage
            setCurrentTab={setCurrentTab}
            islMode={islMode}
            setIslMode={setIslMode}
          />
        )}

        {currentTab === 'home' && (
          <HomeDashboard
            setCurrentTab={setCurrentTab}
            islMode={islMode}
            currentLang={currentLang}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsPage
            setCurrentTab={setCurrentTab}
            setSelectedProject={setSelectedProject}
          />
        )}

        {currentTab === 'my-workspace' && (
          <MyProjectsWorkspace
            selectedProject={selectedProject}
            islMode={islMode}
            currentLang={currentLang}
          />
        )}

        {currentTab === 'ai-mentor' && (
          <AIMentorPage
            currentLang={currentLang}
            islMode={islMode}
          />
        )}

        {currentTab === 'ncert' && (
          <NCERTSection
            setCurrentTab={setCurrentTab}
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
            <span>•</span>
            <span>Member 3 Frontend Deliverable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
