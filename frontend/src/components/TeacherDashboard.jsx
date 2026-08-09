import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Trophy, Target, Download, Search, Rocket, TrendingUp, AlertTriangle, BookOpen, RefreshCw } from "lucide-react";

/* ------------------------------------------------------------------ */
/* STEP 1: FIXED API Import Path (src folder se direct link)          */
/* ------------------------------------------------------------------ */
import { getProgressOverview } from '../api'; 


/* ------------------------------------------------------------------ */
/* Skeleton loading UI                                                */
/* ------------------------------------------------------------------ */
function DashboardSkeleton() {
  return (
    <div className="p-6 w-full space-y-6 animate-pulse">
      <div className="h-8 w-72 rounded-md bg-slate-200" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 h-11 w-11 rounded-xl bg-slate-200" />
            <div className="mb-2 h-7 w-20 rounded-md bg-slate-200" />
            <div className="h-3 w-28 rounded-md bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-5 w-56 rounded-md bg-slate-200" />
        <div className="h-64 w-full rounded-lg bg-slate-100" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-10 w-64 rounded-lg bg-slate-200" />
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Custom dark-mode tooltip                                           */
/* ------------------------------------------------------------------ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="min-w-[150px] rounded-xl border border-slate-800 bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400" />
          Score
        </span>
        <span className="text-xs font-semibold text-white">{payload[0].value}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Summary Card                                                       */
/* ------------------------------------------------------------------ */
function SummaryCard({ icon: Icon, label, value, suffix, gradient, trend }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
      <div
        className={`absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20 ${gradient}`}
      />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${gradient} shadow-sm`}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
        {suffix && <span className="text-lg text-slate-400">{suffix}</span>}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status badge                                                       */
/* ------------------------------------------------------------------ */
function statusClasses(status) {
  if (status.includes("Excelling"))
    return "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
  if (status.includes("Good"))
    return "text-sky-700 bg-sky-50 ring-1 ring-sky-200";
  return "text-amber-700 bg-amber-50 ring-1 ring-amber-200";
}

/* ------------------------------------------------------------------ */
/* Main Dashboard                                                     */
/* ------------------------------------------------------------------ */
export default function TeacherDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ------------------------------------------------------------------ */
  /* STEP 2: Live Data Fetching Logic (with Brahmastra Fallback)        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Live API ko call kar rahe hain 🚀
        const liveData = await getProgressOverview();
        
        // 2. Agar Kritika ke backend se real data aaya toh usko state mein set karo
        if (liveData && liveData.length > 0) {
          setData(liveData);
        } else {
          throw new Error("Backend se data khali aaya hai");
        }
      } catch (error) {
        console.error("Live API fail ho gayi, fallback data use kar rahe hain:", error);
        
        // 3. Fallback Mock Data (Taaki API fail hone par bhi UI mast chalta rahe)
        const mockOverview = [
          { 
            studentName: "Sribendu Prasad Muduli", 
            score: 95, 
            solvedProblems: 18, 
            status: "Active & Excelling 🚀",
            strongTopic: "Recursion & Sorting",
            weakTopic: "Dynamic Programming",
            revisionStatus: "Scheduled for tomorrow"
          },
          { 
            studentName: "Aman Sharma", 
            score: 85, 
            solvedProblems: 14, 
            status: "Good Progress 📈",
            strongTopic: "Arrays & Strings",
            weakTopic: "Graphs & Trees",
            revisionStatus: "Due Today ⚠️"
          },
          { 
            studentName: "Kritika Verma", 
            score: 92, 
            solvedProblems: 17, 
            status: "Active & Excelling 🚀",
            strongTopic: "Object Oriented Programming",
            weakTopic: "Bit Manipulation",
            revisionStatus: "Completed ✅"
          },
        ];
        setData(mockOverview);
      } finally {
        setLoading(false); // Done with fetching, remove skeleton
      }
    };

    fetchDashboardData();
  }, []);

  const overview = useMemo(() => {
    if (!data.length) return { totalStudents: 0, avgScore: 0, totalSolved: 0 };
    const totalStudents = data.length;
    const avgScore = Math.round(data.reduce((sum, s) => sum + s.score, 0) / totalStudents);
    const totalSolved = data.reduce((sum, s) => sum + s.solvedProblems, 0);
    return { totalStudents, avgScore, totalSolved };
  }, [data]);

  const filteredData = useMemo(
    () => data.filter((s) => s.studentName.toLowerCase().includes(search.toLowerCase())),
    [data, search]
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 w-full space-y-6">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Teacher Dashboard &amp; Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track student scores, mastery levels, and spaced revision reminders.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* ---------------- Summary Cards ---------------- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <SummaryCard
          icon={Users}
          label="Total Students"
          value={overview.totalStudents}
          trend="+2 this week"
          gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
        />
        <SummaryCard
          icon={Trophy}
          label="Average Score"
          value={overview.avgScore}
          suffix="%"
          trend="+5% this week"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
        />
        <SummaryCard
          icon={Target}
          label="Problems Solved"
          value={overview.totalSolved}
          trend="+9 this week"
          gradient="bg-gradient-to-br from-sky-500 to-cyan-500"
        />
      </div>

      {/* ---------------- Chart ---------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-900">Student Performance</h2>
          <p className="text-sm text-slate-500">Score comparison across students</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
              <XAxis
                dataKey="studentName"
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "#f1f5f9" }} content={<ChartTooltip />} />
              <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={56} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------------- Student Mastery & Spaced Revision Section ---------------- */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Mastery Tracking */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">Student Topic Mastery</h2>
          </div>
          <p className="text-sm text-slate-500">Identifying strong and weak concepts per student.</p>
          <div className="space-y-3">
            {data.map((student) => (
              <div key={student.studentName} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                <span className="text-sm font-semibold text-slate-800">{student.studentName}</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                    <span className="font-medium">Strong:</span> {student.strongTopic}
                  </div>
                  <div className="p-2 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
                    <span className="font-medium">Weak:</span> {student.weakTopic}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spaced Revision Engine */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-semibold text-slate-900">Spaced Revision Reminders</h2>
          </div>
          <p className="text-sm text-slate-500">Automated reminder system for weak topic reinforcement.</p>
          <div className="space-y-3">
            {data.map((student) => (
              <div key={student.studentName} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{student.studentName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Topic: {student.weakTopic}</p>
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {student.revisionStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Progress Table ---------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Student Progress Overview</h2>
            <p className="text-sm text-slate-500">Detailed breakdown per student</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none ring-indigo-500/30 transition focus:border-indigo-400 focus:bg-white focus:ring-4"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">S.No</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Student Name</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Score</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Solved Problems</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item, index) => (
                <tr key={item.studentName} className="transition-colors duration-150 hover:bg-slate-50/80">
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {item.studentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{item.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-100">
                      {item.score}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{item.solvedProblems}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                        item.status
                      )}`}
                    >
                      {item.status.includes("Excelling") && <Rocket className="h-3 w-3" />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
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