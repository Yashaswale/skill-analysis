"use client";
import { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiClock,
  FiFileText,
  FiUsers,
  FiUpload,
  FiEdit2,
  FiSearch,
  FiFilter,
  FiList,
  FiChevronDown,
  FiMail,
  FiDownload,
  FiEye,
  FiMessageSquare,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiX,
  FiRefreshCw,
  FiFile,
} from "react-icons/fi";
import { jds, cvs, analysis_history, analysis, download_cv, get_email, send_email, email_body, custom_jds, paste_jds, chat, chat_history, conversations } from "../config";

const jdTabs = [  
  { key: "select", label: "Select Existing" },
  { key: "upload", label: "Upload New" },
  { key: "write", label: "Write New" },
];

export default function SkillAnalysisPage() {
  const [activeTab, setActiveTab] = useState("select");
  const [selectedJD, setSelectedJD] = useState(""); // Always the JD **id** string
  const [jdList, setJdList] = useState([]);
  const [cvList, setCvList] = useState([]);
  const [selectedCVs, setSelectedCVs] = useState([]); // array of **id** strings
  const [searchCV, setSearchCV] = useState("");
  const [loadingJDs, setLoadingJDs] = useState(false);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [cvDropdownOpen, setCvDropdownOpen] = useState(false);
  const cvDropdownRef = useRef(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [skillFilter, setSkillFilter] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mailModalOpen, setMailModalOpen] = useState(false);
  const [mailModalCandidate, setMailModalCandidate] = useState(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatModalCandidate, setChatModalCandidate] = useState(null);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [chatConversations, setChatConversations] = useState([]);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadingJD, setUploadingJD] = useState(false);
  const [writingJD, setWritingJD] = useState(false);
  const [writeJDText, setWriteJDText] = useState("");
  const cvFileInputRef = useRef(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadedJDTitle, setUploadedJDTitle] = useState("");
  const [uploadedCVNames, setUploadedCVNames] = useState([]);
  const [uploadedCVs, setUploadedCVs] = useState([]); // {id, name}

  const jdUploadDisabled = Boolean(uploadedJDTitle || selectedJD);

  // --- Helpers --------------------------------------------------------------
  const getCvId = (cv) =>
    (cv.cvId ?? cv.id ?? cv._id ?? cv.fileName ?? cv.filename)?.toString();

  const getJdId = (jd) => (jd.jdId ?? jd.id ?? jd._id ?? jd.uuid ?? jd.slug)?.toString();

  const getJdTitle = (jd) =>
    jd.title || jd.name || jd.position || jd.role || jd.designation || getJdId(jd) || "Untitled JD";

  // --- Data fetching --------------------------------------------------------
  useEffect(() => {
    if (activeTab !== "select") return;

    setLoadingJDs(true);
    fetch(jds, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } })
      .then((res) => res.json())
      .then((data) => setJdList(Array.isArray(data) ? data : data.results || []))
      .finally(() => setLoadingJDs(false));

    setLoadingCVs(true);
    fetch(cvs, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } })
      .then((res) => res.json())
      .then((data) => setCvList(Array.isArray(data) ? data : data.results || []))
      .finally(() => setLoadingCVs(false));
  }, [activeTab]);

  // When switching to Upload New or Write New tabs, clear selections
  useEffect(() => {
    if (activeTab === "upload" || activeTab === "write") {
      setSelectedJD("");
      setUploadedJDTitle("");
      setSelectedCVs([]);
      setUploadedCVNames([]);
      setUploadedCVs([]);
    }
  }, [activeTab]);

  // Close custom CV dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (cvDropdownRef.current && !cvDropdownRef.current.contains(event.target)) {
        setCvDropdownOpen(false);
      }
    }
    if (cvDropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cvDropdownOpen]);

  // --- Selection handlers ---------------------------------------------------
  const handleCVCheck = (cvId) => {
    const idStr = cvId?.toString();
    setSelectedCVs((prev) => (prev.includes(idStr) ? prev.filter((n) => n !== idStr) : [...prev, idStr]));
  };

  const selectedCVNames = cvList
    .filter((cv) => selectedCVs.includes(getCvId(cv)))
    .map((cv) => cv.fileName || cv.filename || cv.name || cv.title || getCvId(cv));

  // --- History --------------------------------------------------------------
  const fetchHistory = async () => {
    if (!selectedJD || selectedCVs.length === 0) return;
    setHistoryLoading(true);
    try {
      // Ensure we pass **jdId** (id string) to the API
      const url = `${analysis_history}?jdId=${encodeURIComponent(selectedJD)}&cvId=${encodeURIComponent(
        selectedCVs[0]
      )}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setHistoryData(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("History fetch error:", err);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- Analysis -------------------------------------------------------------
  const handleStartAnalysis = async () => {
    if (!selectedJD || selectedCVs.length === 0) return;
    setAnalysisLoading(true);
    setAnalysisResults(null);
    setSelectedCandidate(null);
    try {
      const res = await fetch(`${analysis}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          jdId: selectedJD, // Pass the **id** only
          cvIds: selectedCVs, // array of **id** strings
          options: { includeScores: true, language: "en" },
        }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", res.status, errorText);
        throw new Error(`API Error: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setAnalysisResults(data.results || data);
    } catch (err) {
      console.error("Fetch error:", err);
      setAnalysisResults({ error: "Failed to run analysis. " + (err.message || err) });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // --- Download Resume Handler ---
  const handleDownloadCV = async (cvId) => {
    if (!cvId) return;
    const url = download_cv.replace("{cvId}", encodeURIComponent(cvId));
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to download CV");
      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "resume.pdf";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/);
        if (match) filename = match[1];
      }
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download CV");
    }
  };

  // --- Mail Modal Handlers ---
  const openMailModal = (candidate) => {
    setMailModalCandidate(candidate);
    setMailModalOpen(true);
  };
  const closeMailModal = () => {
    setMailModalOpen(false);
    setMailModalCandidate(null);
  };

  // --- Chat Modal Handlers ---
  const openChatModal = (candidate) => {
    setChatModalCandidate(candidate);
    setChatModalOpen(true);
  };
  const closeChatModal = () => {
    setChatModalOpen(false);
    setChatModalCandidate(null);
  };

  // --- Chat History Handlers ---
  const fetchChatHistory = async () => {
    setChatHistoryLoading(true);
    try {
      const res = await fetch(chat_history, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setChatConversations(data.conversations || []);
    } catch (err) {
      console.error("Chat history fetch error:", err);
      setChatConversations([]);
    } finally {
      setChatHistoryLoading(false);
    }
  };

  const fetchConversation = async (conversationId) => {
    try {
      const url = conversations.replace("{conversationId}", conversationId);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setConversationMessages(data.messages || []);
      setSelectedConversation(data);
    } catch (err) {
      console.error("Conversation fetch error:", err);
      setConversationMessages([]);
    }
  };

  const openChatHistory = () => {
    setChatHistoryOpen(true);
    fetchChatHistory();
  };

  const closeChatHistory = () => {
    setChatHistoryOpen(false);
    setSelectedConversation(null);
    setConversationMessages([]);
  };

  // --- Upload New JD Handler ---
  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingJD(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(custom_jds, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload JD");
      // Parse created JD and select it
      const created = await res.json().catch(() => ({}));
      const newJdId = getJdId(created);
      if (newJdId) {
        setSelectedJD(newJdId);
      }
      // show uploaded JD title/name above the uploader (single JD)
      setUploadedJDTitle(created.title || created.name || file.name || newJdId || "");
      // Refresh the list so the new JD appears
      fetch(jds, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } })
        .then((res) => res.json())
        .then((data) => setJdList(Array.isArray(data) ? data : data.results || []));
      alert("JD uploaded successfully!");
    } catch (err) {
      alert("Failed to upload JD");
    } finally {
      setUploadingJD(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Upload New CV Handler ---
  const handleCVFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCV(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(cvs, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload CV");
      // Parse created CV and select it
      const created = await res.json().catch(() => ({}));
      const newCvId = getCvId(created);
      if (newCvId) {
        const idStr = newCvId.toString();
        setSelectedCVs((prev) => (prev.includes(idStr) ? prev : [...prev, idStr]));
      }
      // track uploaded CV name locally for display above uploader
      const createdName = created.fileName || created.filename || created.name || file.name || newCvId || "";
      if (createdName) {
        setUploadedCVNames((prev) => (prev.includes(createdName) ? prev : [...prev, createdName]));
        if (newCvId) {
          setUploadedCVs((prev) => (prev.find((c) => c.id === newCvId) ? prev : [...prev, { id: newCvId, name: createdName }]));
        }
      }
      // Refresh CV list so the new item appears
      fetch(cvs, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } })
        .then((res) => res.json())
        .then((data) => setCvList(Array.isArray(data) ? data : data.results || []));
      alert("CV uploaded successfully!");
    } catch (err) {
      alert("Failed to upload CV");
    } finally {
      setUploadingCV(false);
      if (cvFileInputRef.current) cvFileInputRef.current.value = "";
    }
  };

  const handleCVUploadClick = () => {
    if (cvFileInputRef.current) cvFileInputRef.current.click();
  };

  // --- Drag and Drop Handler ---
  const handleDrop = async (e) => {
    e.preventDefault();
    if (uploadingJD) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileInputChange({ target: { files: [file] } });
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // --- Drag and Drop Handler for CVs ---
  const handleCVFileDrop = async (e) => {
    e.preventDefault();
    if (uploadingCV) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleCVFileInputChange({ target: { files: [file] } });
    }
  };
  const handleCVDragOver = (e) => {
    e.preventDefault();
  };

  // --- Write New JD Handler ---
  const handleSaveJDText = async () => {
    if (!writeJDText.trim()) return;
    setWritingJD(true);
    try {
      // Use paste_jds endpoint with payload {title, content}
      const res = await fetch(paste_jds, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ title: uploadedJDTitle || "Untitled JD", content: writeJDText }),
      });
      if (!res.ok) throw new Error("Failed to save JD");
      // Parse created JD and select it
      const created = await res.json().catch(() => ({}));
      const newJdId = getJdId(created);
      if (newJdId) {
        setSelectedJD(newJdId);
      }
      // show saved JD name (if any) for write-new tab
      setUploadedJDTitle(created.title || created.name || "New JD saved");
      // Refresh the list so the new JD appears
      // Refresh JD list
      fetch(jds, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } })
        .then((res) => res.json())
        .then((data) => setJdList(Array.isArray(data) ? data : data.results || []));
      setWriteJDText("");
      alert("JD saved successfully!");
    } catch (err) {
      alert("Failed to save JD");
    } finally {
      setWritingJD(false);
    }
  };

  // --- Clear/Deselect Handlers ---
  const handleClearJD = () => {
    setUploadedJDTitle("");
    setSelectedJD("");
  };

  const handleRemoveCV = (cvId, name) => {
    if (cvId) {
      const idStr = cvId.toString();
      setSelectedCVs((prev) => prev.filter((id) => id !== idStr));
      setUploadedCVs((prev) => prev.filter((c) => c.id !== cvId));
    }
    if (name) {
      setUploadedCVNames((prev) => prev.filter((n) => n !== name));
    }
  };

  return (
    <div className="bg-[#f5f7fb] min-h-screen h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[360px] bg-white shadow-xl flex flex-col h-full sticky top-0 p-6 border-r border-gray-200 overflow-y-auto max-h-screen">
        {/* Top Buttons */}
        <div className="flex gap-2 mb-8">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors text-sm">
            <FiPlus /> New Analysis
          </button>
          <button
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm"
            onClick={() => {
              setHistoryOpen(true);
              fetchHistory();
            }}
          >
            <FiClock /> History
          </button>
          <button
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm"
            onClick={openChatHistory}
          >
            <FiMessageSquare /> Chat History
          </button>
        </div>

        {/* Job Description Section */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FiFileText className="text-blue-600" />
            <span className="font-semibold text-gray-800 text-base">Job Description</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {jdTabs.map((tab) => (
              <button
                key={tab.key}
                className={`px-3 py-1 rounded-t-lg text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Selected JD label (show above the tab content like CVs) */}
          {uploadedJDTitle && (
            <div className="mb-2">
              <div className="text-xs text-gray-700 font-semibold mb-1">Selected JD:</div>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs truncate max-w-[240px] flex items-center gap-1" title={uploadedJDTitle}>
                  <span className="truncate">{uploadedJDTitle}</span>
                  <button type="button" className="text-red-600 hover:text-red-700" onClick={handleClearJD}>×</button>
                </span>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="mb-4">
            {activeTab === "select" && (
              loadingJDs ? (
                <div className="text-gray-500 text-sm">Loading JDs...</div>
              ) : (
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedJD}
                  onChange={(e) => setSelectedJD(e.target.value)}
                >
                  <option value="">Select a Job Description...</option>
                  {jdList.map((jd, idx) => {
                    const id = getJdId(jd);
                    const label = getJdTitle(jd);
                    // Guard against missing ids in the payload
                    return (
                      <option key={(id ?? "no-id") + "-" + idx} value={id ?? ""} disabled={!id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              )
            )}

            {activeTab === "upload" && (
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-md py-8 px-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors relative"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ minHeight: 120 }}
              >
                <FiUpload className="text-2xl text-blue-500 mb-2" />
                <span className="text-gray-700 text-sm">Drag & Drop files here or click to browse</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ width: "100%", height: "100%" }}
                  onChange={handleFileInputChange}
                  disabled={uploadingJD || jdUploadDisabled}
                />
                {uploadingJD && <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-blue-600 font-semibold">Uploading...</div>}
                {jdUploadDisabled && !uploadingJD && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-gray-600 font-semibold">JD Selected</div>
                )}
              </div>
            )}

            {activeTab === "write" && (
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] mb-2"
                  placeholder="e.g., Senior Software Engineer..."
                  value={writeJDText}
                  onChange={e => setWriteJDText(e.target.value)}
                  disabled={writingJD}
                />
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 transition-colors text-sm flex items-center justify-center gap-2"
                  onClick={handleSaveJDText}
                  disabled={writingJD || jdUploadDisabled}
                >
                  <FiEdit2 /> {writingJD ? "Saving..." : "Save Job Description"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Resumes Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <FiUsers className="text-blue-600" />
            <span className="font-semibold text-gray-800 text-base">Candidate Resumes</span>
          </div>

          {activeTab === "select" && (
            loadingCVs ? (
              <div className="text-gray-500 text-sm mb-3">Loading CVs...</div>
            ) : (
              <>
                {uploadedCVs.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-700 font-semibold mb-1">Selected Resumes:</div>
                    <div className="flex flex-wrap gap-1">
                      {uploadedCVs.map(({id, name}) => (
                        <span key={id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs truncate max-w-[160px] flex items-center gap-1" title={name}>
                          <span className="truncate">{name}</span>
                          <button type="button" className="text-red-600 hover:text-red-700" onClick={() => handleRemoveCV(id, name)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-3 relative" ref={cvDropdownRef}>
                  <button
                    type="button"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setCvDropdownOpen((open) => !open)}
                  >
                    <span className="truncate text-left flex-1">
                      {selectedCVNames.length > 0 ? selectedCVNames.join(", ") : "Select Candidate Resumes..."}
                    </span>
                    <FiChevronDown className={`ml-2 transition-transform ${cvDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {cvDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                      <div className="p-2">
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-gray-800 mb-2 text-sm"
                          placeholder="Search uploaded CVs..."
                          value={searchCV}
                          onChange={(e) => setSearchCV(e.target.value)}
                        />
                        <ul className="space-y-1">
                          {cvList
                            .filter((cv) => (cv.fileName || cv.filename || cv.name || cv.title || "").toLowerCase().includes(searchCV.toLowerCase()))
                            .map((cv, idx) => {
                              const id = getCvId(cv);
                              return (
                                <li key={id + "-" + idx} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-blue-50">
                                  <input
                                    type="checkbox"
                                    checked={selectedCVs.includes(id)}
                                    onChange={() => handleCVCheck(id)}
                                    className="accent-blue-600"
                                  />
                                  <span className="text-gray-800 text-sm truncate">
                                    {cv.fileName || cv.filename || cv.name || cv.title || id}
                                  </span>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <div
                    className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-md py-6 px-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors mb-4 relative"
                    onClick={handleCVUploadClick}
                    onDrop={handleCVFileDrop}
                    onDragOver={handleCVDragOver}
                    style={{ minHeight: 100 }}
                  >
                    <FiUpload className="text-2xl text-blue-500 mb-2" />
                    <span className="text-gray-700 text-sm">Drag & Drop resumes here or click to browse</span>
                    <input
                      type="file"
                      ref={cvFileInputRef}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      style={{ width: "100%", height: "100%" }}
                      onChange={handleCVFileInputChange}
                      disabled={uploadingCV}
                    />
                    {uploadingCV && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-blue-600 font-semibold">
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          )}

          {activeTab !== "select" && (
            <>
              {uploadedCVs.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-700 font-semibold mb-1">Selected Resumes:</div>
                  <div className="flex flex-wrap gap-1">
                    {uploadedCVs.map(({id, name}) => (
                      <span key={id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs truncate max-w-[160px] flex items-center gap-1" title={name}>
                        <span className="truncate">{name}</span>
                        <button type="button" className="text-red-600 hover:text-red-700" onClick={() => handleRemoveCV(id, name)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div
                className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-md py-6 px-3 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors mb-4 relative"
                onClick={handleCVUploadClick}
                onDrop={handleCVFileDrop}
                onDragOver={handleCVDragOver}
                style={{ minHeight: 100 }}
              >
                <FiUpload className="text-2xl text-blue-500 mb-2" />
                <span className="text-gray-700 text-sm">Drag & Drop resumes here or click to browse</span>
                <input
                  type="file"
                  ref={cvFileInputRef}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ width: "100%", height: "100%" }}
                  onChange={handleCVFileInputChange}
                  disabled={uploadingCV}
                />
                {uploadingCV && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-blue-600 font-semibold">
                    Uploading...
                  </div>
                )}
              </div>
            </>
          )}

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 transition-colors mt-2 flex items-center justify-center gap-2"
            onClick={handleStartAnalysis}
            disabled={analysisLoading || !selectedJD || selectedCVs.length === 0}
          >
            {analysisLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Running Analysis...
              </span>
            ) : (
              <>
                <FiSearch /> Start Analysis
              </>
            )}
          </button>
        </div>
      </aside>

      {/* History Sidebar */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-white shadow-2xl h-full overflow-y-auto border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">History</h2>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md" onClick={fetchHistory}>
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md" onClick={() => setHistoryOpen(false)}>
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : historyData.length > 0 ? (
                <div className="space-y-4">
                  {historyData.map((item, idx) => (
                    <div key={(item.cv_name || item.filename || "history") + "-" + idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3 mb-2">
                        <FiFile className="text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{item.cv_name || item.filename || `Analysis ${idx + 1}`}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp || item.created_at || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-700 mb-3 line-clamp-2">
                        {item.description || item.summary || "Analysis completed for the selected candidate and job description."}
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md">2 msg</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiClock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No analysis history found</p>
                  <p className="text-sm">Run an analysis to see history</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/50 flex-1" onClick={() => setHistoryOpen(false)}></div>
        </div>
      )}

      {/* Chat History Sidebar */}
      {chatHistoryOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-96 bg-white shadow-2xl h-full overflow-y-auto border-r border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Chat History</h2>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md" onClick={fetchChatHistory}>
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md" onClick={closeChatHistory}>
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {chatHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : chatConversations.length > 0 ? (
                <div className="space-y-4">
                  {chatConversations.map((conversation) => (
                    <div 
                      key={conversation.conversationId} 
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => fetchConversation(conversation.conversationId)}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <FiMessageSquare className="text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            Conversation {conversation.conversationId.slice(-8)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {conversation.messageCount} messages • {new Date(conversation.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-700 mb-3 line-clamp-2">
                        {conversation.lastMessage?.substring(0, 100)}...
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        Click to view conversation
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiMessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No chat conversations found</p>
                  <p className="text-sm">Start chatting with candidates to see history</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/50 flex-1" onClick={closeChatHistory}></div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-10 overflow-auto max-h-screen bg-[#e9eefb]">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-black flex-1">Candidate Matching Results</h1>
          <div className="flex gap-2 items-center">
            {analysisResults?.candidates && Array.isArray(analysisResults.candidates) && (
              <>
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px]"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  >
                    <option value="">Filter by Skill (any)</option>
                    {Array.from(new Set((analysisResults.candidates || []).flatMap((c) => c?.skills_analysis?.matched_skills || []))).map((skill) => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 whitespace-nowrap">Min Overall %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={minMatch}
                    onChange={(e) => {
                      const v = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                      setMinMatch(v);
                    }}
                    className="w-20 border text-black border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Loader */}
        {analysisLoading && (
          <div className="flex flex-1 items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="ml-4 text-lg text-blue-700 font-semibold">Running analysis...</span>
          </div>
        )}

        {/* Results Cards */}
        {!analysisLoading && analysisResults && !selectedCandidate && !analysisResults.error && (
          <div className="flex flex-wrap gap-8">
            {Array.isArray(analysisResults.candidates) ? (
              analysisResults.candidates
                .filter((candidate) => {
                  const overall = Number(candidate?.match_metrics?.overall_score || 0);
                  const skillList = candidate?.skills_analysis?.matched_skills || [];
                  const skillOk = !skillFilter || skillList.includes(skillFilter);
                  const matchOk = overall >= minMatch;
                  return skillOk && matchOk;
                })
                .map((candidate) => (
                <div key={candidate.cv_id} className="bg-white rounded-xl shadow-lg p-6 w-[340px] flex flex-col items-center relative">
                  {/* Score */}
                  <div className="absolute top-6 right-6">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="absolute top-0 left-0" width="56" height="56">
                        <circle cx="28" cy="28" r="26" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                        <circle
                          cx="28"
                          cy="28"
                          r="26"
                          stroke="#2563eb"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={2 * Math.PI * 26 * (1 - (candidate.match_metrics?.overall_score || 0) / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xl font-bold text-blue-700 z-10">{candidate.match_metrics?.overall_score || 0}%</span>
                    </div>
                  </div>

                  <img src={candidate.basic_details?.avatar || "/profile.png"} alt="avatar" className="w-20 h-20 rounded-full object-cover mb-2 mt-2" />
                  <div className="text-lg font-bold text-black mb-1">{candidate.basic_details?.full_name}</div>
                  <div className="text-gray-700 text-sm mb-1 flex items-center gap-1">
                    <FiMail className="inline" /> {candidate.basic_details?.email}
                  </div>
                  <div className="text-gray-700 text-sm mb-2 flex items-center gap-1">
                    <FiPhone className="inline" /> {candidate.basic_details?.phone_number}
                  </div>

                  {/* Matched Skills */}
                  <div className="flex items-center gap-2 mb-1 mt-2">
                    <FiCheckCircle className="text-green-600" />
                    <span className="font-semibold text-gray-800 text-sm">Matched Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(candidate.skills_analysis?.matched_skills || []).slice(0, 2).map((skill) => (
                      <span key={skill} className="bg-green-100 text-green-700 rounded-md px-2 py-1 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills_analysis?.matched_skills?.length > 2 && (
                      <span className="bg-green-50 text-green-700 rounded-md px-2 py-1 text-xs font-medium">
                        {candidate.skills_analysis.matched_skills.length - 2}+...
                      </span>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div className="flex items-center gap-2 mb-1 mt-2">
                    <FiXCircle className="text-red-500" />
                    <span className="font-semibold text-gray-800 text-sm">Missing Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(candidate.skills_analysis?.missing_skills || []).slice(0, 2).map((skill) => (
                      <span key={skill} className="bg-red-100 text-red-700 rounded-md px-2 py-1 text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills_analysis?.missing_skills?.length > 2 && (
                      <span className="bg-red-50 text-red-700 rounded-md px-2 py-1 text-xs font-medium">
                        {candidate.skills_analysis.missing_skills.length - 2}+...
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between w-full mt-4 mb-2 px-2 relative">
                    <button className="flex flex-col items-center text-gray-700 hover:text-blue-600 text-xs" onClick={() => setSelectedCandidate(candidate)}>
                      <FiEye className="text-lg" />view
                    </button>
                    <button className="flex flex-col items-center text-gray-700 hover:text-blue-600 text-xs" onClick={() => handleDownloadCV(candidate.cv_id)}>
                      <FiDownload className="text-lg" />Download
                    </button>
                    <button className="flex flex-col items-center text-gray-700 hover:text-blue-600 text-xs" onClick={() => openMailModal(candidate)}>
                      <FiMail className="text-lg" />Mail
                    </button>
                    <button 
                      className="flex flex-col items-center text-gray-700 hover:text-blue-600 text-xs cursor-pointer relative z-10" 
                      onClick={() => openChatModal(candidate)}
                      style={{ minHeight: '40px', minWidth: '50px' }}
                    >
                      <FiMessageSquare className="text-lg mb-1" />
                      <span>Chat</span>
                    </button>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 mt-2">Download ATS Resume</button>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center w-full">No candidates found.</div>
            )}
          </div>
        )}

        {/* Error */}
        {!analysisLoading && analysisResults && analysisResults.error && (
          <div className="flex flex-1 items-center justify-center text-red-600 font-semibold">
            {analysisResults.error}
          </div>
        )}

        {/* Detailed Candidate View */}
        {selectedCandidate && (
          <DetailedCandidateView candidate={selectedCandidate} onBack={() => setSelectedCandidate(null)} />
        )}

        {/* Empty state */}
        {!analysisLoading && !analysisResults && (
          <div className="flex flex-col items-center justify-center flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ready for Analysis</h2>
            <p className="text-gray-600 text-center">Select a JD and CVs to begin.</p>
          </div>
        )}
      </main>

      {mailModalOpen && (
        <MailModal candidate={mailModalCandidate} onClose={closeMailModal} />
      )}

      {chatModalOpen && (
        <ChatModal 
          candidate={chatModalCandidate} 
          jdId={selectedJD}
          onClose={closeChatModal} 
        />
      )}

      {/* Conversation Modal */}
      {selectedConversation && (
        <ConversationModal 
          conversation={selectedConversation}
          messages={conversationMessages}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}

function DetailedCandidateView({ candidate, onBack }) {
  return (
    <div className="max-w-4xl mx-auto w-full bg-white rounded-xl shadow-lg p-8">
      <button className="mb-4 text-blue-600 hover:underline text-sm" onClick={onBack}>
        Back
      </button>
      <div className="flex gap-6 mb-6">
        <img src={candidate.basic_details?.avatar || "/profile.png"} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex gap-4 mb-2">
            <div className="bg-blue-100 text-blue-600 rounded-lg px-4 py-2 text-center flex-1">
              <div className="text-2xl font-bold">{candidate.match_metrics?.overall_score || "68%"}</div>
              <div className="text-xs font-semibold">Overall Match</div>
            </div>
            <div className="bg-green-100 text-green-600 rounded-lg px-4 py-2 text-center flex-1">
              <div className="text-2xl font-bold">{candidate.match_metrics?.keyword_coverage || "10%"}</div>
              <div className="text-xs font-semibold">Keyword Coverage</div>
            </div>
          </div>
          <div className="text-xs text-gray-700 mb-2">{candidate.match_metrics?.experience_match}</div>
          <div className="text-blue-700 font-semibold text-xs cursor-pointer">Experience Match</div>
        </div>
      </div>

      <div className="mb-2 font-bold text-lg text-black">{candidate.basic_details?.full_name}</div>
      <div className="text-gray-700 text-sm mb-1 flex items-center gap-1">
        <FiMail className="inline" /> {candidate.basic_details?.email}
      </div>
      <div className="text-gray-700 text-sm mb-1 flex items-center gap-1">
        <FiPhone className="inline" /> {candidate.basic_details?.phone_number}
      </div>
      <div className="text-gray-700 text-sm mb-1 flex items-center gap-1">
        {candidate.basic_details?.total_experience && <span>{candidate.basic_details?.total_experience} experience</span>}
      </div>

      {/* Skills Analysis */}
      <div className="mt-6 flex gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FiCheckCircle className="text-green-600" />
            <span className="font-semibold text-gray-800 text-sm">Matched Skills</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(candidate.skills_analysis?.matched_skills || []).map((skill) => (
              <span key={skill} className="bg-green-100 text-green-700 rounded-md px-2 py-1 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-blue-700 text-sm">Additional Skills</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(candidate.skills_analysis?.additional_skills || []).map((skill) => (
              <span key={skill} className="bg-blue-100 text-blue-700 rounded-md px-2 py-1 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FiXCircle className="text-red-500" />
            <span className="font-semibold text-gray-800 text-sm">Missing Skills</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {(candidate.skills_analysis?.missing_skills || []).map((skill) => (
              <span key={skill} className="bg-red-100 text-red-700 rounded-md px-2 py-1 text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Gap Analysis */}
      <div className="mt-6">
        <div className="font-bold text-gray-800 mb-2">Gap Analysis</div>
        {candidate.gap_analysis?.critical_gaps?.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-red-600 text-sm mb-1">Critical Gaps</div>
            <ul className="list-disc list-inside text-gray-900 text-sm">
              {candidate.gap_analysis.critical_gaps.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
        {candidate.gap_analysis?.moderate_gaps?.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-orange-500 text-sm mb-1">Moderate Gaps</div>
            <ul className="list-disc list-inside text-gray-900 text-sm">
              {candidate.gap_analysis.moderate_gaps.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
        {candidate.gap_analysis?.minor_gaps?.length > 0 && (
          <div className="mb-2">
            <div className="font-semibold text-blue-600 text-sm mb-1">Minor Gaps</div>
            <ul className="list-disc list-inside text-gray-900 text-sm">
              {candidate.gap_analysis.minor_gaps.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed Reasoning */}
      <div className="mt-6">
        <div className="font-bold text-gray-800 mb-2">Detailed Reasoning</div>
        <div className="bg-gray-50 rounded-md p-4 text-sm text-gray-700 whitespace-pre-line">
          {candidate.detailed_reasoning && <ReasoningText text={candidate.detailed_reasoning} />}
        </div>
      </div>
    </div>
  );
}

// ReasoningText component to highlight section titles and keywords
function ReasoningText({ text }) {
  const lines = text.split(/\n/);
  return (
    <>
      {lines.map((line, idx) => {
        if (
          /^(HR Skill Gap Analysis|MATCH_SCORE|SKILLS_FOUND|MISSING_SKILLS|ADDITIONAL_SKILLS|EXPERIENCE_MATCH|REASONING|Skills Alignment|Critical Skills Missing|Relevant Additional Skills|Experience Level)/.test(
            line
          )
        ) {
          let color = "";
          if (line.startsWith("SKILLS_FOUND")) color = "text-blue-700";
          if (line.startsWith("MISSING_SKILLS")) color = "text-red-600";
          if (line.startsWith("ADDITIONAL_SKILLS")) color = "text-blue-500";
          if (line.startsWith("EXPERIENCE_MATCH")) color = "text-green-600";
          if (line.startsWith("REASONING")) color = "text-blue-700";
          if (line.startsWith("Critical Skills Missing")) color = "text-red-600";
          if (line.startsWith("Skills Alignment")) color = "text-green-700";
          if (line.startsWith("Relevant Additional Skills")) color = "text-blue-700";
          if (line.startsWith("Experience Level")) color = "text-purple-700";
          return (
            <div key={idx} className={`font-semibold ${color}`}>
              {line}
            </div>
          );
        }
        if (/^\d+\./.test(line)) {
          return (
            <div key={idx} className="font-semibold text-gray-800 mt-2">
              {line}
            </div>
          );
        }
        return <div key={idx}>{line}</div>;
      })}
    </>
  );
}

function MailModal({ candidate, onClose }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [suggestion, setSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(true);
  const [suggestionError, setSuggestionError] = useState("");

  useEffect(() => {
    if (!candidate) return;
    setLoading(true);
    setError("");
    setSuggestion(null);
    setSuggestionLoading(true);
    setSuggestionError("");
    // Fetch email
    fetch(get_email.replace("{cvId}", encodeURIComponent(candidate.cv_id)), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setEmail(data.email || data.result || ""))
      .catch(() => setError("Failed to fetch email."));
    // Fetch suggestion (GET with cvId in query param)
    fetch(`${email_body}?cvId=${encodeURIComponent(candidate.cv_id)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.suggestions && data.suggestions.subject && data.suggestions.body) {
          setSuggestion(data.suggestions);
        } else if (data.detail && Array.isArray(data.detail) && data.detail[0]?.msg) {
          setSuggestionError(data.detail[0].msg);
        } else {
          setSuggestionError("No suggestion available.");
        }
      })
      .catch(() => setSuggestionError("Failed to fetch suggestion."))
      .finally(() => setSuggestionLoading(false));
    setLoading(false);
  }, [candidate]);

  const handleUseSuggestion = () => {
    if (suggestion) {
      setSubject(suggestion.subject || "");
      setBody(suggestion.body || "");
    }
  };

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      const payload = {
        cvId: candidate.cv_id,
        subject,
        body,
        cc: cc ? cc.split(",").map((e) => e.trim()) : [],
        bcc: bcc ? bcc.split(",").map((e) => e.trim()) : [],
        attachments, // Not implemented: file upload UI
      };
      const res = await fetch(send_email, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send email");
      onClose();
      alert("Email sent successfully!");
    } catch (err) {
      setError("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-0 relative text-black flex flex-col md:flex-row h-[80vh]">
        <button className="absolute top-2 right-2 text-black hover:text-red-600 z-10" onClick={onClose}>&times;</button>
        {/* Email Form */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto min-w-0">
          <h2 className="text-xl font-bold mb-4">Send Email to Candidate</h2>
          {loading ? (
            <div className="text-center text-black">Loading...</div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex flex-col h-full">
              {error && <div className="text-red-600 mb-2">{error}</div>}
              <div className="mb-2">
                <label className="block text-sm font-semibold mb-1">To</label>
                <input type="email" className="w-full border rounded px-2 py-1 text-black" value={email} readOnly />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <input type="text" className="w-full border rounded px-2 py-1 text-black" value={subject} onChange={e => setSubject(e.target.value)} required />
              </div>
              <div className="mb-2 flex-1 flex flex-col">
                <label className="block text-sm font-semibold mb-1">Body</label>
                <textarea className="w-full border rounded px-2 py-1 min-h-[100px] text-black flex-1" value={body} onChange={e => setBody(e.target.value)} required />
              </div>
              <div className="mb-2 flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">CC</label>
                  <input type="text" className="w-full border rounded px-2 py-1 text-black" value={cc} onChange={e => setCc(e.target.value)} placeholder="Comma separated" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-1">BCC</label>
                  <input type="text" className="w-full border rounded px-2 py-1 text-black" value={bcc} onChange={e => setBcc(e.target.value)} placeholder="Comma separated" />
                </div>
              </div>
              {/* Attachments UI can be added here if needed */}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black" onClick={onClose} disabled={sending}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={sending}>{sending ? "Sending..." : "Send"}</button>
              </div>
            </form>
          )}
        </div>
        {/* Suggestions Panel */}
        <div className="w-full md:w-[350px] border-l border-gray-200 bg-gray-50 p-4 flex flex-col overflow-y-auto max-h-[80vh] min-w-0">
          <div className="font-bold mb-2">Suggestions</div>
          {suggestionLoading ? (
            <div className="text-black text-xs">Loading suggestions...</div>
          ) : suggestionError ? (
            <div className="text-red-600 text-xs">{suggestionError}</div>
          ) : suggestion ? (
            <>
              <div className="font-semibold">Subject:</div>
              <div className="mb-2 text-sm break-words">{suggestion.subject}</div>
              <div className="font-semibold">Body:</div>
              <div className="mb-2 text-sm whitespace-pre-line break-words">{suggestion.body}</div>
              <button type="button" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs" onClick={handleUseSuggestion}>
                Use Suggestion
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ChatModal({ candidate, jdId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState("");

  useEffect(() => {
    if (!candidate || !jdId) return;
    setLoading(true);
    setError("");
    setMessages([]);
    
    // Fetch chat history
    const url = `${chat}?jdId=${encodeURIComponent(jdId)}&cvId=${encodeURIComponent(candidate.cv_id)}`;
    fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
      })
      .catch(() => setError("Failed to load chat history"))
      .finally(() => setLoading(false));
  }, [candidate, jdId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !jdId || !candidate?.cv_id) return;
    
    setSending(true);
    setError("");
    
    try {
      const payload = {
        jdId,
        cvId: candidate.cv_id,
        message: newMessage.trim(),
        conversationId: conversationId || ""
      };
      
      const res = await fetch(chat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Failed to send message");
      
      const data = await res.json();
      
      // Add the new message to the list
      const userMessage = {
        id: Date.now(),
        message: newMessage.trim(),
        sender: "user",
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // If there's a response from the AI, add it too
      if (data.response) {
        const aiMessage = {
          id: Date.now() + 1,
          message: data.response,
          sender: "ai",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      
      // Update conversation ID if provided
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[600px] flex flex-col relative">
        <button className="absolute top-2 right-2 text-black hover:text-red-600 z-10" onClick={onClose}>&times;</button>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Chat with {candidate?.basic_details?.full_name || "Candidate"}</h2>
          <p className="text-sm text-gray-600">{candidate?.basic_details?.email}</p>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="text-center text-black">Loading chat history...</div>
          ) : error ? (
            <div className="text-red-600 text-center">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet. Start a conversation!</div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <div className="text-sm">{msg.message}</div>
                    <div className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConversationModal({ conversation, messages, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col relative">
        <button className="absolute top-2 right-2 text-black hover:text-red-600 z-10" onClick={onClose}>&times;</button>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">Conversation Details</h2>
          <p className="text-sm text-gray-600">
            Conversation ID: {conversation.conversationId}
          </p>
          <p className="text-sm text-gray-600">
            JD ID: {conversation.jdId} | CV ID: {conversation.cvId}
          </p>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages in this conversation</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {new Date(message.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total Messages: {messages.length}</span>
            <span>Last Updated: {new Date(conversation.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
