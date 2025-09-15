"use client";
import { useState } from "react";
import { FiClock, FiSearch, FiSend, FiLink, FiFileText, FiFile } from "react-icons/fi";

const chatHistory = [
  {
    title: "Marketing Campaign Ideas",
    subtext: "Brainstorming social posts",
    date: "7/12/2025",
  },
  {
    title: "Python Code Debugging",
    subtext: "Fixing a loop error",
    date: "7/12/2025",
  },
];

const quickActions = [
  "Summarize key point",
  "Extract all data?",
  "List action items",
  "What is the main topic?",
];

export default function ChatDashboard() {
  const [search, setSearch] = useState("");
  const [url, setUrl] = useState("");
  const [chatInput, setChatInput] = useState("");

  const filteredChats = chatHistory.filter(
    (chat) =>
      chat.title.toLowerCase().includes(search.toLowerCase()) ||
      chat.subtext.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 bg-white border-r shadow-sm flex-shrink-0 flex flex-col gap-6 p-4 md:h-screen md:overflow-y-auto">
        {/* Chat History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="text-lg text-blue-600" />
            <span className="text-lg font-semibold">Chat History</span>
          </div>
          <div className="relative mb-3">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            />
          </div>
          <div className="overflow-y-auto max-h-56 pr-1">
            {filteredChats.length === 0 ? (
              <div className="text-gray-400 text-sm text-center mt-8">No chats found.</div>
            ) : (
              <ul className="space-y-3">
                {filteredChats.map((chat, idx) => (
                  <li key={idx} className="flex flex-col bg-white rounded-lg shadow-md p-3 cursor-pointer hover:bg-blue-50 transition-colors">
                    <span className="font-medium text-gray-800 truncate">{chat.title}</span>
                    <span className="text-sm text-gray-500 truncate">{chat.subtext}</span>
                    <span className="text-xs text-gray-400 mt-1">{chat.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Analyze Web URL */}
        <div className="mt-6">
          <div className="text-lg font-semibold mb-3">Analyze Web URL</div>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Paste URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            />
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors w-full"
            >
              <FiLink className="mr-1" /> Load & Analyze URL
            </button>
          </div>
        </div>
      </aside>
      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 bg-white">
          <h1 className="text-lg font-semibold text-gray-900">New Chat</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors">
              <FiFileText className="mr-1" /> Export Word
            </button>
            <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors">
              <FiFile className="mr-1" /> Export PDF
            </button>
          </div>
        </div>
        {/* Chat Container */}
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-2 md:px-8 py-4">
          <div className="text-xl font-semibold text-gray-400 mb-2 text-center">Start a Conversation with AI</div>
          <div className="text-sm text-gray-500 text-center mb-8">Type your question below, select a chat from history, or load a URL to discuss</div>
        </div>
        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-md p-4 mx-2 md:mx-8 mb-4">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action) => (
              <button
                key={action}
                type="button"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-xs font-medium border border-blue-100 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
          <form className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question about the document..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
            >
              <FiSend className="mr-2" /> Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
