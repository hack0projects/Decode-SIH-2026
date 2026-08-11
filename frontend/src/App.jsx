import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TeacherDashboard from './components/TeacherDashboard';
import AIMentorPage from './components/AIMentorPage';
import MyProjectsWorkspace from './components/MyProjectsWorkspace';

export default function App() {
  // Developer Bypass: Hackathon demo ke liye pre-filled user state
  const [user, setUser] = useState({ 
    displayName: "Sribendu Prasad Muduli", 
    email: "sribendu@sih.com",
    role: "student" // 'student' ya 'teacher'
  });
  
  // Active navigation tab state
  const [activeTab, setActiveTab] = useState('workspace');

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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-start p-4 max-w-7xl mx-auto w-full">
        
        {/* Responsive Navigation Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-6 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'workspace' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Code Workspace & Notebook 💻
          </button>
          
          <button 
            onClick={() => setActiveTab('mentor')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'mentor' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Socratic AI Mentor 🤖
          </button>

          <button 
            onClick={() => setActiveTab('teacher')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Teacher Portal & Analytics 📊
          </button>
        </div>

        {/* Dynamic Component Rendering based on Active Tab */}
        <div className="w-full flex-grow">
          {activeTab === 'workspace' && <MyProjectsWorkspace user={user} />}
          {activeTab === 'mentor' && <AIMentorPage user={user} />}
          {activeTab === 'teacher' && <TeacherDashboard />}
        </div>
      </main>
    </div>
  );
}