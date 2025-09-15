"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const analytics = [
  { icon: "📄", label: "Total JDs Uploaded", value: "1,234" },
  { icon: "📑", label: "Total CVs Processed", value: "8,839" },
  { icon: "🤖", label: "AI Chatbot Interaction", value: "5,324" },
  { icon: "🌐", label: "Unique URLs Analyzed", value: "213" },
];

const avgMatchScore = [
  { name: "Python", value: 90 },
  { name: "SDE", value: 80 },
  { name: "Dot Net", value: 75 },
  { name: "Java", value: 70 },
  { name: "Flutter", value: 65 },
];

const missingSkills = [
  { skill: "Microsoft Word", percent: 70 },
  { skill: "Microsoft Excel", percent: 69 },
  { skill: "Leadership", percent: 64 },
  { skill: "Written Communication", percent: 56 },
  { skill: "Oral Communication", percent: 52 },
];

const foundSkills = [
  { skill: "Problem Solving", percent: 90 },
  { skill: "Analytic Skill", percent: 89 },
  { skill: "HTML", percent: 84 },
  { skill: "Java", percent: 82 },
  { skill: "Python", percent: 80 },
];

const docTypes = [
  { name: "Resume", value: 1203, color: "#e11d48" },
  { name: "Cover Letter", value: 893, color: "#6366f1" },
  { name: "Portfolio", value: 453, color: "#f59e42" },
  { name: "LinkedIn", value: 235, color: "#10b981" },
  { name: "Others", value: 122, color: "#64748b" },
];

const chatTrendsWeek = [
  { name: "Week 1", value: 300 },
  { name: "Week 2", value: 450 },
  { name: "Week 3", value: 500 },
  { name: "Week 4", value: 200 },
];
const chatTrendsDays = [
  { name: "Mon", value: 120 },
  { name: "Tue", value: 180 },
  { name: "Wed", value: 220 },
  { name: "Thu", value: 160 },
  { name: "Fri", value: 300 },
  { name: "Sat", value: 90 },
  { name: "Sun", value: 60 },
];

const faqs = [
  "Summarize this document",
  "Extract dates and names",
  "What are the key action items?",
  "Explain X concept",
  "Compare with JD",
  "Extract Skills",
];

export default function DashboardPage() {
  const [trendType, setTrendType] = useState("Week");
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.replace("/login");
  };
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Analytics Overview</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded px-4 py-2 text-sm shadow"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {analytics.map((item) => (
            <div key={item.label} className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-start">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-gray-700 text-sm mb-1">{item.label}</div>
              <div className="text-2xl font-bold text-black">{item.value}</div>
            </div>
          ))}
        </div>
        {/* Skill Analysis Performance Section */}
        <h2 className="text-lg font-semibold mb-4 text-black">Skill Analysis Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Average Match Score (Horizontal Bar Chart) */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="font-semibold mb-4 text-black">Average Match Score</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={avgMatchScore}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#374151', fontSize: 14 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 6, 6]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Top Missing Skills */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="font-semibold mb-4 text-black">Top Missing Skills</div>
            <ul className="space-y-4">
              {missingSkills.map((item) => (
                <li key={item.skill} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-700">{item.skill}</span>
                    <span className="text-red-700 font-semibold">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-red-100 rounded-full">
                    <div
                      className="h-2 bg-red-400 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Top Found Skills */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="font-semibold mb-4 text-black">Top Found Skills</div>
            <ul className="space-y-4">
              {foundSkills.map((item) => (
                <li key={item.skill} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-700">{item.skill}</span>
                    <span className="text-green-700 font-semibold">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-green-100 rounded-full">
                    <div
                      className="h-2 bg-green-400 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Lower Section: Pie, Chat Trends, FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Document Types Analyzed (Pie Chart) */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
            <div className="font-semibold mb-4 text-black">Document Types Analyzed</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={docTypes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name }) => name}
                >
                  {docTypes.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Chat Interaction Trends (Bar Chart) */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-black">Chat Interaction Trends</span>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 text-xs rounded font-medium ${trendType === "Days" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
                  onClick={() => setTrendType("Days")}
                >
                  Days
                </button>
                <button
                  className={`px-3 py-1 text-xs rounded font-medium ${trendType === "Week" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
                  onClick={() => setTrendType("Week")}
                >
                  Week
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={trendType === "Week" ? chatTrendsWeek : chatTrendsDays}
                margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
              >
                <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 13 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Frequently Asked Queries */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="font-semibold mb-4 text-black">Frequently Asked Queries</div>
            <ul className="space-y-3">
              {faqs.map((q, i) => (
                <li key={i}>
                  <a href="#" className="text-blue-700 hover:underline text-sm">{q}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
