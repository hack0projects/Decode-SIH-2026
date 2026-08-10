import React, { useState, useEffect } from 'react';

export default function MyProjectsWorkspace() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Student name encode karke live backend API call lagayi
    const studentName = encodeURIComponent("Sribendu Prasad Muduli");
    const apiUrl = `https://decode-sih-2026.onrender.com/student-profile/${studentName}`;

    setLoading(true);
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch data from live backend');
        }
        return response.json();
      })
      .then((data) => {
        setProfileData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-blue-600 font-semibold text-lg animate-pulse">Loading live workspace data... 🚀</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 m-6 bg-red-50 border border-red-200 rounded-2xl text-red-600 shadow-sm">
        <h3 className="font-bold text-lg">Backend Connection Error</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-3xl shadow-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {profileData?.studentName || 'Student'}! 👋
          </h1>
          <p className="text-blue-100 text-sm mt-2">
            Workspace Status: <span className="font-semibold underline">{profileData?.status || 'Active'}</span>
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-sm font-medium border border-white/20 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          Live Backend Connected ⚡
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Score</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-3">
            {profileData?.score ?? 0} <span className="text-sm font-medium text-slate-500">pts</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Problems Solved</h3>
          <p className="text-3xl font-extrabold text-slate-800 mt-3">
            {profileData?.solvedProblems ?? 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Strong Topic</h3>
          <p className="text-xl font-bold text-emerald-600 mt-3 truncate">
            {profileData?.strongTopic || 'N/A'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Revision Status</h3>
          <p className="text-xl font-bold text-amber-600 mt-3 truncate">
            {profileData?.revisionStatus || 'Needs Revision'}
          </p>
        </div>
      </div>

      {/* Additional Workspace Workspace Analytics Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Recent Activity & Progress</h2>
        <p className="text-slate-500 text-sm">
          Your live backend synchronization is active. All submissions and score metrics are automatically updated via Kritika's deployed Render service.
        </p>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Weak Topic Area:</span>
          <span className="font-semibold text-rose-600">{profileData?.weakTopic || 'None recorded yet'}</span>
        </div>
      </div>
    </div>
  );
}