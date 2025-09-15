"use client";
import { useState } from "react";
import { FiUpload, FiSearch, FiSend } from "react-icons/fi";

const documents = [
  "Q2_sales_Report_2024.pdf",
  "Marketing_strategy_2025.docx",
  "HR_Policy_Handbook.pdf",
  "Product_Roadmap_Q3.pptx",
];

const quickActions = [
  "Summarize key point",
  "Extract all data?",
  "List action items",
  "What is the main topic?",
];

export default function DocumentChat() {
  const [search, setSearch] = useState("");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [responseType, setResponseType] = useState("Text");
  const [chatInput, setChatInput] = useState("");

  const filteredDocs = documents.filter((doc) =>
    doc.toLowerCase().includes(search.toLowerCase())
  );

  const handleDocCheck = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc)
        ? prev.filter((d) => d !== doc)
        : [...prev, doc]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 border-r border-gray-200 flex-shrink-0 flex flex-col gap-6 p-4 md:h-screen md:overflow-y-auto">
        {/* Analytics Overview Card with Drag & Drop */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-2 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all">
          <FiUpload className="text-3xl text-gray-400 mb-2" />
          <div className="text-gray-600 text-center">
            <span className="font-medium">Drag & Drop files here</span> or click to browse
          </div>
        </div>
        {/* My Document List */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col h-full max-h-[60vh]">
          <div className="flex items-center mb-3">
            <span className="font-semibold text-gray-900 flex-1">My Document ({documents.length})</span>
          </div>
          <div className="relative mb-3">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            />
          </div>
          <div className="overflow-y-auto flex-1 pr-1">
            {filteredDocs.length === 0 ? (
              <div className="text-gray-400 text-sm text-center mt-8">No documents found.</div>
            ) : (
              <ul className="space-y-2">
                {filteredDocs.map((doc) => (
                  <li key={doc} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc)}
                      onChange={() => handleDocCheck(doc)}
                      className="accent-blue-600"
                    />
                    <span className="truncate text-gray-700 text-sm">{doc}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 bg-white">
          <h1 className="text-lg font-semibold text-gray-900">Document Analysis Chatbot</h1>
          <div className="relative w-64 max-w-full ml-4">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in chat..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            />
          </div>
        </div>
        {/* Chat Container */}
        <div className="flex-1 flex flex-col justify-between bg-gray-50 px-2 md:px-8 py-4">
          {/* Chat messages would go here (empty for now) */}
          <div className="flex-1" />
          {/* Input Area */}
          <div className="bg-white rounded-2xl shadow-md p-4 mt-4">
            <form className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="text"
                placeholder="Ask a question about the document..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm mb-2 md:mb-0"
              />
              <select
                value={responseType}
                onChange={(e) => setResponseType(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 mb-2 md:mb-0 md:ml-2"
              >
                <option>Text</option>
                <option>Table</option>
                <option>Summary</option>
              </select>
              <button
                type="submit"
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors md:ml-2"
              >
                <FiSend className="mr-2" /> Send
              </button>
            </form>
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
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
          </div>
        </div>
      </main>
    </div>
  );
}
