"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiSearch, FiSend, FiLoader } from "react-icons/fi";
import { 
  document_analysis, 
  upload_document, 
  search_document, 
  list_documents,
  documents_history 
} from "../config.js";

// Remove static documents array - will be fetched from API

const quickActions = [
  "Summarize key point",
  "Extract all data?",
  "List action items",
  "What is the main topic?",
];

export default function DocumentChat() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [responseType, setResponseType] = useState("Text");
  const [chatInput, setChatInput] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [questionInput, setQuestionInput] = useState("");
  const [selectedDocumentForAnalysis, setSelectedDocumentForAnalysis] = useState(null);
  const fileInputRef = useRef(null);
  const [toasts, setToasts] = useState([]);

  // Lightweight toast notifications
  const notify = (variant, title, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, variant, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helpers to safely handle API document shapes
  const getDocId = (doc) => {
    if (doc && typeof doc === 'object') {
      return doc.document_id ?? doc.id ?? doc._id ?? doc.documentId ?? doc.uuid ?? doc.name ?? doc.filename ?? null;
    }
    return doc ?? null;
  };

  const getDocName = (doc) => {
    if (doc && typeof doc === 'object') {
      return (
        doc.filename ??
        doc.name ??
        doc.title ??
        doc.original_name ??
        doc.file_name ??
        String(getDocId(doc) ?? 'Unknown')
      );
    }
    return String(doc ?? '');
  };

  // Auth helpers
  const getAccessToken = () => {
    try {
      const token = localStorage.getItem("accessToken");
      const expiryRaw = localStorage.getItem("accessTokenExpiry");
      if (!token || !expiryRaw) return null;
      const expiry = Number(expiryRaw);
      if (Number.isNaN(expiry) || Date.now() > expiry) return null;
      return token;
    } catch {
      return null;
    }
  };

  const authFetch = async (url, options = {}) => {
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      throw new Error("Not authenticated");
    }
    const headers = new Headers(options.headers || {});
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const finalOptions = { ...options, headers };
    const res = await fetch(url, finalOptions);
    if (res.status === 401) {
      router.push("/login");
      throw new Error("Unauthorized");
    }
    return res;
  };

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // API Functions
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await authFetch(list_documents, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await authFetch(upload_document, {
        method: 'POST',
        headers: {},
        body: formData
      });

      if (response.ok) {
        notify('success', 'Upload complete', 'Document uploaded successfully!');
        // Refetch documents after successful upload
        await fetchDocuments();
      } else {
        notify('error', 'Upload failed', 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      notify('error', 'Upload error', 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentSearch = async (query) => {
    try {
      setLoading(true);
      const response = await authFetch(search_document, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        console.error('Failed to search documents');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAnalysis = async (document_id, questions) => {
    try {
      setLoading(true);
      const response = await authFetch(document_analysis, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_id: document_id,
          analysis_type: "summary",
          questions: questions
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [
          ...prev,
          { type: 'user', content: questions.join(', ') },
          { type: 'assistant', content: data.summary || data.analysis || data.result || 'Analysis completed' }
        ]);
      } else {
        console.error('Failed to analyze document');
        notify('error', 'Analysis failed', 'Failed to analyze document');
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
      notify('error', 'Analysis error', 'Error analyzing document');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    getDocName(doc).toLowerCase().includes(search.toLowerCase())
  );

  const handleDocSelect = (doc) => {
    const docId = getDocId(doc);
    
    // Single document selection - toggle if already selected
    if (selectedDocumentForAnalysis === docId) {
      setSelectedDocumentForAnalysis(null);
      setSelectedDocs([]);
    } else {
      setSelectedDocumentForAnalysis(docId);
      setSelectedDocs([docId]);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFileUpload(file));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => handleFileUpload(file));
  };


  const handleAnalyzeClick = () => {
    if (selectedDocumentForAnalysis && questionInput.trim()) {
      handleDocumentAnalysis(selectedDocumentForAnalysis, [questionInput.trim()]);
      setQuestionInput("");
    }
  };

  const handleQuickAction = (action) => {
    // Fill the input with the selected quick action; user can edit and press Analyze/Enter
    setQuestionInput(action);
  };

  const handleLoadHistory = async () => {
    if (!selectedDocumentForAnalysis) return;
    
    try {
      setLoading(true);
      const url = documents_history.replace('{document_id}', selectedDocumentForAnalysis);
      const response = await authFetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Format the document history in a structured way
        const docName = getDocName(documents.find(doc => getDocId(doc) === selectedDocumentForAnalysis));
        const formattedContent = `# Document History: ${docName}

**Document Information:**
- **Document ID:** ${data.document_id}
- **Filename:** ${data.filename}
- **Document Type:** ${data.document_type}
- **Upload Date:** ${new Date(data.upload_date).toLocaleString()}
- **Page Count:** ${data.page_count}
- **Word Count:** ${data.word_count}
- **Owner:** ${data.owner}
- **Total Chunks:** ${data.total_chunks}

**Tags:** ${data.tags && data.tags.length > 0 ? data.tags.join(', ') : 'None'}

**Description:** ${data.description || 'No description available'}

**Sample Content:**
${data.sample_content || 'No content available'}`;

        setChatMessages(prev => [
          ...prev,
          { 
            type: 'assistant', 
            content: formattedContent
          }
        ]);
      } else {
        console.error('Failed to load document history');
        notify('error', 'Load history failed', 'Failed to load document history');
      }
    } catch (error) {
      console.error('Error loading document history:', error);
      notify('error', 'Load history error', 'Error loading document history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocumentForAnalysis) return;
    
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      const url = documents_history.replace('{document_id}', selectedDocumentForAnalysis);
      const response = await authFetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        notify('success', 'Deleted', 'Document deleted successfully!');
        // Clear selection and refetch documents
        setSelectedDocumentForAnalysis(null);
        setSelectedDocs([]);
        await fetchDocuments();
        // Clear chat messages
        setChatMessages([]);
      } else {
        console.error('Failed to delete document');
        notify('error', 'Delete failed', 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      notify('error', 'Delete error', 'Error deleting document');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatMessages([]);
    setSelectedDocumentForAnalysis(null);
    setSelectedDocs([]);
    setQuestionInput("");
  };

  // Function to format the summary text with proper styling
  const formatSummaryText = (text) => {
    if (!text) return text;
    
    // Split by double newlines to handle paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle headers (# ## ###)
      if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)[0].length;
        const content = paragraph.replace(/^#+\s*/, '');
        const HeaderTag = `h${Math.min(level, 6)}`;
        return (
          <div key={index} className={`font-bold text-gray-900 mt-4 mb-2 ${
            level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'
          }`}>
            {content}
          </div>
        );
      }
      
      // Handle bold text (**text**)
      const formattedParagraph = paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-semibold text-gray-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      
      return (
        <div key={index} className="mb-3 text-gray-700 leading-relaxed">
          {formattedParagraph}
        </div>
      );
    });
  };

  return (
    <div className="bg-gray-50 h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-sm rounded-md shadow-lg px-4 py-3 border ${
              t.variant === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="font-semibold text-sm">{t.title}</div>
            <div className="text-xs mt-0.5 opacity-90">{t.message}</div>
          </div>
        ))}
      </div>
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 border-r border-gray-200 flex-shrink-0 flex flex-col gap-6 p-4 h-full overflow-y-auto">
        {/* Analytics Overview Card with Drag & Drop */}
        <div 
          className="bg-white rounded-2xl shadow-md p-4 mb-2 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <FiLoader className="text-3xl text-blue-500 mb-2 animate-spin" />
          ) : (
            <FiUpload className="text-3xl text-gray-400 mb-2" />
          )}
          <div className="text-gray-600 text-center">
            <span className="font-medium">Drag & Drop files here</span> or click to browse
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.pptx"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        {/* My Document List */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900">My Documents ({documents.length})</span>
            <button
              onClick={handleNewChat}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-3 py-1.5 text-sm transition-colors"
            >
              New Chat
            </button>
          </div>
          {/* Action Buttons - Show when document is selected */}
          {selectedDocumentForAnalysis && (
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleLoadHistory}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Load History
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          )}
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
            {loading ? (
              <div className="flex items-center justify-center mt-8">
                <FiLoader className="text-gray-400 animate-spin mr-2" />
                <span className="text-gray-400 text-sm">Loading documents...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-gray-400 text-sm text-center mt-8">No documents found.</div>
            ) : (
              <ul className="space-y-2">
                {filteredDocs.map((doc) => (
                  <li key={getDocId(doc)} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="document-selection"
                      checked={selectedDocumentForAnalysis === getDocId(doc)}
                      onChange={() => handleDocSelect(doc)}
                      className="accent-blue-600"
                    />
                    <span className="truncate text-gray-700 text-sm">
                      {getDocName(doc)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
      {/* Main Panel */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 bg-white flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-900">Document Analysis Chatbot</h1>
          <div className="relative w-64 max-w-full ml-4">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in chat..."
              onChange={(e) => {
                if (e.target.value.trim()) {
                  handleDocumentSearch(e.target.value);
                }
              }}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            />
          </div>
        </div>
        {/* Chat Container */}
        <div className="flex-1 flex flex-col justify-between bg-gray-50 px-2 md:px-8 py-4 overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <FiSearch className="text-4xl mb-2 mx-auto" />
                  <p>Select a document and ask questions to analyze it</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white max-w-xs lg:max-w-md'
                          : 'bg-white text-gray-900 border border-gray-200 max-w-2xl lg:max-w-4xl'
                      }`}
                    >
                      {message.type === 'assistant' ? formatSummaryText(message.content) : message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg flex items-center">
                      <FiLoader className="animate-spin mr-2" />
                      Analyzing document...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Input Area */}
          <div className="bg-white rounded-2xl shadow-md p-4 mt-4 flex-shrink-0">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <input
                type="text"
                placeholder="Ask a question about the document..."
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                disabled={!selectedDocumentForAnalysis || loading}
                className="flex-1 px-4 py-2 rounded-lg border text-black border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm mb-2 md:mb-0 disabled:opacity-50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading && selectedDocumentForAnalysis && questionInput.trim()) {
                      handleAnalyzeClick();
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAnalyzeClick}
                disabled={!selectedDocumentForAnalysis || loading || !questionInput.trim()}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors md:ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <FiLoader className="mr-2 animate-spin" />
                ) : (
                  <FiSend className="mr-2" />
                )}
                Analyze
              </button>
            </div>
            {!selectedDocumentForAnalysis && (
              <p className="text-sm text-gray-500 mt-2">Please select a document to start analyzing</p>
            )}
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleQuickAction(action)}
                  disabled={!selectedDocumentForAnalysis || loading}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-xs font-medium border border-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
