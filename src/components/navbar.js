'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Document Analysis", href: "/document_analysis" },
  { name: "Skill Analysis", href: "/skill_analisis" },
  { name: "AI Chatbot", href: "/ai_chatbot" },
];

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/login") return null;
  // Hide navbar if not authenticated on client-side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('accessTokenExpiry');
    const isExpired = expiry ? Date.now() > Number(expiry) : false;
    if (!token || isExpired) return null;
  }

  return (
    <nav className="w-full bg-gray-100 shadow-sm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Logo or Brand can go here if needed */}
      </div>
      <div className="flex gap-2 bg-[#f3f6fd] rounded-lg p-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">Praveen</span>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 border border-blue-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-blue-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z"
            />
          </svg>
        </div>
      </div>
    </nav>
  );
}
