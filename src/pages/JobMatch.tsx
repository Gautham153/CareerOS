/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Layers,
  Award,
  Zap,
  Check,
  RefreshCw,
  Trash2,
  Briefcase,
  Search,
  DollarSign,
  Clock,
  ArrowUpRight,
  HelpCircle,
  User,
  LineChart,
  FileDown,
  X,
  Plus,
  Compass,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  MapPin,
  Flame,
  FileSpreadsheet,
  Copy,
  History,
  FileQuestion,
  HelpCircle as HelpIcon,
  Sparkle,
  ExternalLink
} from "lucide-react";
import { useAnalysis } from "../hooks/useAnalysis";
import { apiService, JobMatchResult, JobMatchPayload } from "../services/api";
import { extractTextFromFile } from "../utils/fileParser";
import Navbar from "../components/Navbar";
import { FeatureGate } from "../components/FeatureGate";

interface JobMatchHistoryItem {
  id: string;
  role: string;
  company: string;
  matchScore: number;
  date: string;
  resumeUsed: string;
  result: JobMatchResult;
  jobDescription?: string;
  jobPreferences?: any;
}

const POPULAR_ROLES = [
  { 
    category: "Software Engineering", 
    roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", "React Developer", "Angular Developer", "Vue Developer", "Java Developer", "Python Developer", "Node.js Developer", "PHP Developer", ".NET Developer", "C++ Developer", "Go Developer", "Rust Developer", "Web Developer", "WordPress Developer", "Shopify Developer"] 
  },
  { 
    category: "Mobile Development", 
    roles: ["Android Developer", "iOS Developer", "Flutter Developer", "React Native Developer", "Xamarin Developer"] 
  },
  { 
    category: "AI & Data", 
    roles: ["Machine Learning Engineer", "AI Engineer", "Generative AI Engineer", "Prompt Engineer", "Data Scientist", "Data Analyst", "Business Intelligence Analyst", "Data Engineer", "MLOps Engineer"] 
  },
  { 
    category: "Cloud & DevOps", 
    roles: ["DevOps Engineer", "Cloud Engineer", "AWS Engineer", "Azure Engineer", "Google Cloud Engineer", "Platform Engineer", "Site Reliability Engineer"] 
  },
  { 
    category: "Cyber Security", 
    roles: ["Cybersecurity Analyst", "Penetration Tester", "SOC Analyst", "Security Engineer"] 
  },
  { 
    category: "UI / UX", 
    roles: ["UI Designer", "UX Designer", "UI/UX Designer", "Product Designer", "Graphic Designer", "Motion Designer"] 
  },
  { 
    category: "Testing", 
    roles: ["QA Engineer", "Automation Tester", "Manual Tester", "Performance Tester"] 
  },
  { 
    category: "Business", 
    roles: ["Business Analyst", "Product Manager", "Project Manager", "Scrum Master", "Operations Manager"] 
  },
  { 
    category: "HR", 
    roles: ["Recruiter", "HR Executive", "Talent Acquisition Specialist"] 
  },
  { 
    category: "Finance", 
    roles: ["Financial Analyst", "Accountant"] 
  },
  { 
    category: "Marketing", 
    roles: ["Digital Marketing Executive", "SEO Specialist", "SEM Specialist", "Content Writer", "Social Media Manager"] 
  },
  { 
    category: "Sales", 
    roles: ["Sales Executive", "Customer Success Manager", "Customer Support Engineer"] 
  }
];

const SAMPLE_JDS: Record<string, string> = {
  "Frontend Developer": "About Us:\nJoin our high-growth SaaS engineering team as a Senior Frontend Developer. We are building the next generation of collaborative workspace applications and need an expert to own client-side architecture.\n\nRequired Skills & Technologies:\n- 3+ years experience with React 18, TypeScript, and Tailwind CSS.\n- Strong expertise in state management (Redux Toolkit, Zustand).\n- Experience with Next.js, SSR, and Static Site Generation.\n- Hands-on experience with unit testing frameworks (Jest, Vitest, React Testing Library).\n- Knowledge of CI/CD pipelines and bundlers like Vite or Webpack.\n\nResponsibilities:\n- Develop responsive, accessible (WCAG), and highly interactive user interfaces.\n- Optimize application performance to achieve Google Lighthouse scores above 90.\n- Collaborate with product designers and backend engineers to integrate REST/GraphQL APIs.",
  "Backend Developer": "About Us:\nWe are seeking a Backend Software Engineer to design, build, and maintain our high-volume distributed microservices. You will work on optimizing database queries, microservices architecture, and cloud deployment pipelines.\n\nRequired Skills & Technologies:\n- 3+ years experience in Node.js, Go, or Python.\n- Deep understanding of SQL databases (PostgreSQL) and NoSQL (MongoDB, Redis).\n- Experience with Docker containerization and Kubernetes orchestration.\n- Strong knowledge of RESTful API design, gRPC, and message brokers (RabbitMQ, Kafka).\n- Solid understanding of cloud infrastructure (AWS or Google Cloud).\n\nResponsibilities:\n- Design scalable, secure, and resilient API backend systems.\n- Optimize database architectures and query executions for low latency.\n- Write unit, integration, and load tests to guarantee 99.9% uptime.",
  "Data Scientist": "About Us:\nJoin our AI Lab as a Data Scientist to build and deploy advanced machine learning models that drive product personalization and intelligent workflows.\n\nRequired Skills:\n- Strong foundation in machine learning, statistics, and mathematics.\n- Proficient in Python, Pandas, NumPy, Scikit-Learn, and PyTorch or TensorFlow.\n- Solid understanding of SQL and data warehousing platforms (Snowflake, BigQuery).\n- Experience deploying models as REST APIs via FastAPI or Docker.\n- Knowledge of natural language processing (NLP) and Large Language Models (LLMs) is a plus.\n\nResponsibilities:\n- Clean, preprocess, and analyze high-dimensional structured and unstructured datasets.\n- Architect, train, and validate predictive machine learning and deep learning models.\n- Translate complex statistical insights into clear business outcomes.",
  "Full Stack Developer": "About Us:\nWe are looking for a versatile Full Stack Developer to bridge the gap between our fluid client interfaces and robust backend microservices.\n\nRequired Skills:\n- Fluent in React, TypeScript, and Node.js (Express/NestJS).\n- Experience with relational databases like PostgreSQL and ORMs (Prisma, Drizzle).\n- Proficient in Tailwind CSS and modern web vitals optimization.\n- Strong understanding of REST APIs, WebSockets, and authentication (JWT, OAuth).\n- Experience with cloud providers (AWS, Heroku, Vercel) and Docker.\n\nResponsibilities:\n- Implement pixel-perfect designs with flexible client-side responsiveness.\n- Architect and document robust APIs with fast database read/write speeds.\n- Manage the complete deployment lifecycle of the full-stack system."
};

export default function JobMatch() {
  const navigate = useNavigate();
  const { currentFile, activeResumeText, isAnalyzing: isGeneralAnalyzing } = useAnalysis();

  // Inputs State
  const [resumeText, setResumeText] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeSize, setResumeSize] = useState<number | null>(null);
  
  const [jobDescription, setJobDescription] = useState("");
  const [jdFileName, setJdFileName] = useState("");
  const [jdFileSize, setJdFileSize] = useState<number | null>(null);

  // Status & Results
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Drag states
  const [isResumeDragActive, setIsResumeDragActive] = useState(false);
  const [isJdDragActive, setIsJdDragActive] = useState(false);

  // Interactivity states
  const [appliedImprovements, setAppliedImprovements] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "roadmap" | "recruiter">("overview");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  // Premium Engine States
  const [selectedRole, setSelectedRole] = useState("");
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedRoleIndex, setFocusedRoleIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [jobPreferences, setJobPreferences] = useState({
    preferredLocation: "",
    experienceLevel: "",
    employmentType: "",
    industry: "",
    salaryExpectation: ""
  });
  const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);

  // Cover Letter & Interview prep overlay states
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);

  const [interviewPrepData, setInterviewPrepData] = useState<{ question: string; answer: string; strategy: string }[]>([]);
  const [isGeneratingInterviewPrep, setIsGeneratingInterviewPrep] = useState(false);
  const [isInterviewPrepOpen, setIsInterviewPrepOpen] = useState(false);

  // History & Comparison States
  const [matchHistory, setMatchHistory] = useState<JobMatchHistoryItem[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Load Saved History
  useEffect(() => {
    try {
      const stored = localStorage.getItem("resume_iq_job_match_history");
      if (stored) {
        setMatchHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  // Sync general analyzed resume text if present
  useEffect(() => {
    if (activeResumeText && !resumeText) {
      setResumeText(activeResumeText);
      setResumeName(currentFile?.name || "Active Resume");
      setResumeSize(currentFile?.size || null);
    }
  }, [activeResumeText, currentFile, resumeText]);

  // Handle local Resume File Upload
  const handleResumeFile = async (file: File) => {
    setError(null);
    try {
      setResumeName(file.name);
      setResumeSize(file.size);
      const parsed = await extractTextFromFile(file);
      setResumeText(parsed.text);
    } catch (err: any) {
      setError(err.message || "Failed to extract text from resume file.");
    }
  };

  // Handle local Job Description File Upload
  const handleJdFile = async (file: File) => {
    setError(null);
    try {
      setJdFileName(file.name);
      setJdFileSize(file.size);
      const parsed = await extractTextFromFile(file);
      setJobDescription(parsed.text);
    } catch (err: any) {
      setError(err.message || "Failed to extract text from job description file.");
    }
  };

  const clearResume = () => {
    setResumeText("");
    setResumeName("");
    setResumeSize(null);
    setMatchResult(null);
    setError(null);
    setJobDescription("");
    setJdFileName("");
    setJdFileSize(null);
    setSelectedRole("");
    setTargetRoleInput("");
    setJobPreferences({
      preferredLocation: "",
      experienceLevel: "",
      employmentType: "",
      industry: "",
      salaryExpectation: ""
    });
    setAppliedImprovements({});
  };

  const clearJd = () => {
    setJobDescription("");
    setJdFileName("");
    setJdFileSize(null);
  };

  // Flattened roles list for searchable dropdown autocomplete
  const ALL_ROLES_FLAT = POPULAR_ROLES.reduce((acc, item) => {
    return [...acc, ...item.roles];
  }, []);

  // Filtered roles list based on user search query
  const filteredRoles = ALL_ROLES_FLAT.filter(role =>
    role.toLowerCase().includes(targetRoleInput.toLowerCase())
  );

  // Set the selected role and prefill sample JD if applicable
  const selectRoleItem = (roleName: string) => {
    setSelectedRole(roleName);
    setTargetRoleInput(roleName);
    setIsDropdownOpen(false);
    setFocusedRoleIndex(-1);
    
    if (!jobDescription.trim() && SAMPLE_JDS[roleName]) {
      setJobDescription(SAMPLE_JDS[roleName]);
    }
  };

  // Keyboard navigation within the dropdown list
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return;
    
    const maxIndex = targetRoleInput.trim() ? filteredRoles.length : filteredRoles.length - 1;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedRoleIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedRoleIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedRoleIndex >= 0) {
        if (focusedRoleIndex === filteredRoles.length && targetRoleInput.trim()) {
          selectRoleItem(targetRoleInput.trim());
        } else if (filteredRoles[focusedRoleIndex]) {
          selectRoleItem(filteredRoles[focusedRoleIndex]);
        }
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Paste text directly from clipboard for fast input
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setJobDescription(text);
        setJdFileName("Pasted Content");
        setJdFileSize(text.length);
      }
    } catch (err) {
      console.error("Failed to read from clipboard:", err);
    }
  };

  // Generate a tailored cover letter using the ApiService
  const handleGenerateCoverLetter = async () => {
    if (!resumeText.trim()) return;
    setIsGeneratingCoverLetter(true);
    setIsCoverLetterOpen(true);
    try {
      const coverLetter = await apiService.generateCoverLetter({
        resumeText: resumeText.trim(),
        targetRole: selectedRole.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
        jobPreferences: (jobPreferences.preferredLocation || jobPreferences.experienceLevel || jobPreferences.employmentType || jobPreferences.industry || jobPreferences.salaryExpectation) ? jobPreferences : undefined
      });
      setCoverLetterText(coverLetter);
    } catch (err) {
      console.error("Failed to generate cover letter:", err);
      setCoverLetterText("Failed to generate cover letter. Please verify server connection and try again.");
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Generate standard interview preparation question-answer-strategy kits
  const handleGenerateInterviewPrep = async () => {
    if (!resumeText.trim()) return;
    setIsGeneratingInterviewPrep(true);
    setIsInterviewPrepOpen(true);
    try {
      const prep = await apiService.generateInterviewPrep({
        resumeText: resumeText.trim(),
        targetRole: selectedRole.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
        jobPreferences: (jobPreferences.preferredLocation || jobPreferences.experienceLevel || jobPreferences.employmentType || jobPreferences.industry || jobPreferences.salaryExpectation) ? jobPreferences : undefined
      });
      setInterviewPrepData(prep);
    } catch (err) {
      console.error("Failed to generate interview prep:", err);
    } finally {
      setIsGeneratingInterviewPrep(false);
    }
  };

  // Helper utility to render a nested list of strings
  const renderInsightsList = (items?: string[]) => {
    if (!items || items.length === 0) return <p className="text-xs text-slate-500 italic">None specified</p>;
    return (
      <ul className="list-disc pl-4 space-y-1 mt-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-xs text-slate-300 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
  };

  // Run the premium match analysis
  const runJobMatchAnalysis = async () => {
    if (!resumeText.trim() || (!jobDescription.trim() && !selectedRole.trim())) return;
    
    setIsMatching(true);
    setError(null);
    setAppliedImprovements({});
    
    try {
      const payload: JobMatchPayload = {
        resumeText: resumeText.trim(),
        jobDescription: jobDescription.trim() || undefined,
        targetRole: selectedRole.trim() || undefined,
        jobPreferences: (jobPreferences.preferredLocation || jobPreferences.experienceLevel || jobPreferences.employmentType || jobPreferences.industry || jobPreferences.salaryExpectation) ? jobPreferences : undefined
      };

      const result = await apiService.matchJobDescription(payload);
      setMatchResult(result);
      if (resumeName) {
        localStorage.setItem("resume_iq_job_matched_" + resumeName, "true");
      }

      // Save to local match history
      const detectedCompany = (text: string) => {
        if (!text) return "";
        const lines = text.split("\n");
        for (const line of lines) {
          const match = line.match(/(?:about|at|join|with)\s+([A-Z][a-zA-Z0-9\s.]{2,20})/i);
          if (match) return match[1].trim();
        }
        return "";
      };

      const newHistoryItem: JobMatchHistoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        role: selectedRole.trim() || "General Target Role",
        company: detectedCompany(jobDescription) || "Target Company",
        matchScore: result.match_score,
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        resumeUsed: resumeName || "Active Resume",
        result: result,
        jobDescription: jobDescription,
        jobPreferences: jobPreferences
      };
      
      const updatedHistory = [newHistoryItem, ...matchHistory];
      setMatchHistory(updatedHistory);
      localStorage.setItem("resume_iq_job_match_history", JSON.stringify(updatedHistory));

    } catch (err: any) {
      setError(err.message || "An error occurred during Job Match analysis. Please try again.");
    } finally {
      setIsMatching(false);
    }
  };

  // Toggle checklist improvements
  const applyImprovement = (index: number, text: string) => {
    setAppliedImprovements(prev => ({
      ...prev,
      [index]: true
    }));
    navigator.clipboard.writeText(text);
    setCopiedText(`copied-${index}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatBytes = (bytes: number | null) => {
    if (bytes === null || bytes === undefined) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Download printable report
  const downloadReport = () => {
    window.print();
  };

  // Highlight keywords directly in the JD text
  const renderHighlightedJd = () => {
    if (!matchResult || !jobDescription) return <p className="whitespace-pre-wrap">{jobDescription}</p>;

    const matching = matchResult.matching_keywords || [];
    const missing = matchResult.missing_keywords || [];

    // Simple case-insensitive match highlighter
    let highlightedText = jobDescription;
    
    // Sort descending by length to avoid highlighting substrings first
    const allKeywords = [
      ...matching.map(k => ({ word: k, type: "match" })),
      ...missing.map(k => ({ word: k, type: "missing" }))
    ].sort((a, b) => b.word.length - a.word.length);

    if (allKeywords.length === 0) {
      return <p className="whitespace-pre-wrap">{jobDescription}</p>;
    }

    // Build regular expression for exact words
    try {
      // Escape keywords for regex
      const escapedKeywords = allKeywords.map(k => k.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
      // Match keywords as words
      const regex = new RegExp(`\\b(${escapedKeywords.join("|")})\\b`, "gi");

      const parts = jobDescription.split(regex);
      return (
        <p className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">
          {parts.map((part, idx) => {
            const matchedKeyword = allKeywords.find(k => k.word.toLowerCase() === part.toLowerCase());
            if (matchedKeyword) {
              const bgClass = matchedKeyword.type === "match" 
                ? "bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/50 px-1 rounded" 
                : "bg-rose-500/20 text-rose-300 border-b border-rose-500/50 px-1 rounded";
              return (
                <span key={idx} className={`${bgClass} font-semibold inline-block`} title={`${matchedKeyword.type === "match" ? "Matched Keyword" : "Missing Keyword"}`}>
                  {part}
                </span>
              );
            }
            return <span key={idx}>{part}</span>;
          })}
        </p>
      );
    } catch (e) {
      // Fallback
      return <p className="whitespace-pre-wrap">{jobDescription}</p>;
    }
  };

  return (
    <FeatureGate requiredPlan="PREMIUM">
      <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white pb-16">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 print:p-0 print:max-w-none">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-white/5 pb-6 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3">
              <Sparkles size={12} className="animate-pulse" />
              SaaS Premium Feature
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              AI Job Match Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Optimize your resume for any specific job description. Identify keyword gaps, tool requirements, and receive hand-crafted improvements in real-time.
            </p>
          </div>
          
          {matchResult && (
            <button
              onClick={downloadReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-slate-900 border border-white/10 text-slate-200 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
            >
              <FileDown size={14} />
              Export Match PDF
            </button>
          )}
        </div>

        {/* Outer Grid (Input panels or result view) */}
        {!matchResult ? (
          <div className="space-y-8 print:hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Column 1: Resume Source */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden flex-1 flex flex-col justify-between min-h-[350px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2.5">
                      <FileText size={18} className="text-indigo-400" />
                      1. Resume Source
                    </h3>

                    {resumeText ? (
                      // Active state
                      <div className="flex flex-col gap-4">
                        <div className="p-4 bg-slate-950/60 border border-emerald-500/20 rounded-2xl flex items-start justify-between gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                              <FileText className="text-emerald-400" size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-200 truncate">{resumeName}</p>
                              <p className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5">
                                {formatBytes(resumeSize) || "Active Cache"} • Ready
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={clearResume}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Remove resume"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 font-mono text-slate-500 text-[10px] overflow-y-auto max-h-[160px]">
                          {resumeText.substring(0, 500)}...
                        </div>
                      </div>
                    ) : (
                      // Upload dropzone
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsResumeDragActive(true); }}
                        onDragLeave={() => setIsResumeDragActive(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsResumeDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            await handleResumeFile(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[220px] ${
                          isResumeDragActive
                            ? "border-indigo-400 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                            : "border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-slate-950/40"
                        }`}
                      >
                        <input
                          type="file"
                          id="resume-upload-match"
                          className="hidden"
                          accept=".pdf,.docx"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              await handleResumeFile(e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="resume-upload-match" className="cursor-pointer flex flex-col items-center">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400 transition-transform group-hover:scale-105">
                            <Upload size={18} className="animate-bounce" />
                          </div>
                          <p className="text-xs font-bold text-slate-200">Upload your Resume</p>
                          <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                            Drag & drop or click to browse standard PDF or Word (.docx) files
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                  
                  {/* Auto Quickfill Banner */}
                  {activeResumeText && !resumeText && (
                    <div className="mt-4 p-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-indigo-300">
                        <Sparkles size={12} className="shrink-0" />
                        <span>Use active resume cache?</span>
                      </div>
                      <button
                        onClick={() => {
                          setResumeText(activeResumeText);
                          setResumeName(currentFile?.name || "Active Resume");
                          setResumeSize(currentFile?.size || null);
                        }}
                        className="px-2 py-0.5 bg-indigo-500 text-white rounded-md text-[9px] font-bold hover:bg-indigo-600 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Target Role & Job Preferences */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden flex-1 flex flex-col min-h-[350px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2.5">
                    <Compass size={18} className="text-indigo-400" />
                    2. Target Role & Preferences
                  </h3>

                  {/* Searchable dropdown */}
                  <div className="relative mb-4" ref={dropdownRef}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Job Title</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={targetRoleInput}
                        onChange={(e) => {
                          setTargetRoleInput(e.target.value);
                          setSelectedRole(e.target.value);
                          setIsDropdownOpen(true);
                          setFocusedRoleIndex(-1);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Choose your target role..."
                        aria-label="Target Job Title Search"
                        className="w-full p-3 pl-10 pr-4 bg-slate-950/60 border border-white/10 rounded-2xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all font-sans"
                      />
                      <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      {targetRoleInput && (
                        <button
                          onClick={() => {
                            setSelectedRole("");
                            setTargetRoleInput("");
                            setFocusedRoleIndex(-1);
                          }}
                          className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Dropdown Options */}
                    {isDropdownOpen && (
                      <div className="absolute z-30 left-0 right-0 mt-2 max-h-[220px] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] custom-scrollbar">
                        {/* Custom role typing helper */}
                        {targetRoleInput.trim() && (
                          <button
                            type="button"
                            onClick={() => selectRoleItem(targetRoleInput.trim())}
                            className={`w-full text-left p-3 text-xs flex items-center justify-between border-b border-white/5 transition-all ${
                              focusedRoleIndex === filteredRoles.length
                                ? "bg-indigo-500/20 text-indigo-300"
                                : "text-slate-300 hover:bg-white/5"
                            }`}
                          >
                            <span className="font-semibold truncate">Use custom: "{targetRoleInput}"</span>
                            <Plus size={12} className="text-indigo-400 shrink-0" />
                          </button>
                        )}

                        {filteredRoles.length > 0 ? (
                          filteredRoles.map((role, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectRoleItem(role)}
                              className={`w-full text-left px-4 py-2.5 text-xs transition-all ${
                                focusedRoleIndex === idx
                                  ? "bg-indigo-500/20 text-indigo-300 font-semibold"
                                  : "text-slate-300 hover:bg-white/5"
                              }`}
                            >
                              {role}
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-xs text-slate-500 text-center">No matching template roles</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Collapsible Job Preferences */}
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20">
                    <button
                      type="button"
                      onClick={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
                      className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-indigo-400" />
                        Job Preferences
                      </span>
                      {isPreferencesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isPreferencesExpanded && (
                      <div className="p-4 border-t border-white/5 space-y-3 bg-slate-950/40 animate-slideDown">
                        
                        {/* Preferred Location */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Preferred Location</label>
                          <select
                            value={jobPreferences.preferredLocation}
                            onChange={(e) => setJobPreferences(p => ({ ...p, preferredLocation: e.target.value }))}
                            className="w-full p-2 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Choose Location...</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="On-site">On-site</option>
                            <option value="Bangalore">Bangalore</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Hyderabad">Hyderabad</option>
                            <option value="Pune">Pune</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Anywhere">Anywhere</option>
                          </select>
                        </div>

                        {/* Experience Level */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experience Level</label>
                          <select
                            value={jobPreferences.experienceLevel}
                            onChange={(e) => setJobPreferences(p => ({ ...p, experienceLevel: e.target.value }))}
                            className="w-full p-2 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Choose Experience...</option>
                            <option value="Intern">Intern</option>
                            <option value="Fresher">Fresher (0 Years)</option>
                            <option value="0-1 Years">0-1 Years</option>
                            <option value="1-3 Years">1-3 Years</option>
                            <option value="3-5 Years">3-5 Years</option>
                            <option value="5+ Years">5+ Years</option>
                          </select>
                        </div>

                        {/* Employment Type */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employment Type</label>
                          <select
                            value={jobPreferences.employmentType}
                            onChange={(e) => setJobPreferences(p => ({ ...p, employmentType: e.target.value }))}
                            className="w-full p-2 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Choose Type...</option>
                            <option value="Internship">Internship</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </div>

                        {/* Industry */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Industry</label>
                          <select
                            value={jobPreferences.industry}
                            onChange={(e) => setJobPreferences(p => ({ ...p, industry: e.target.value }))}
                            className="w-full p-2 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Choose Industry...</option>
                            <option value="Software">Software & IT</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Finance">Finance</option>
                            <option value="Education">Education</option>
                            <option value="Retail">Retail</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Gaming">Gaming</option>
                            <option value="AI">Artificial Intelligence</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* Salary Expectation */}
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Salary Expectation (Optional)</label>
                          <input
                            type="text"
                            value={jobPreferences.salaryExpectation}
                            onChange={(e) => setJobPreferences(p => ({ ...p, salaryExpectation: e.target.value }))}
                            placeholder="e.g. $80k - $100k or 12 LPA"
                            className="w-full p-2 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 3: Target Job Description */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col flex-1 min-h-[350px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Briefcase size={16} className="text-purple-400" />
                      3. Target Job Description
                    </h3>
                  </div>

                  {/* Helpers Bar */}
                  <div className="flex flex-wrap gap-1 mb-2 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={pasteFromClipboard}
                      className="px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                      title="Paste from clipboard"
                    >
                      Paste
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById("jd-upload-match")?.click()}
                      className="px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                      title="Upload PDF or DOCX"
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const matched = SAMPLE_JDS[selectedRole] || SAMPLE_JDS["Frontend Developer"];
                        setJobDescription(matched);
                        setJdFileName("Sample Description");
                        setJdFileSize(matched.length);
                      }}
                      className="px-2 py-1 text-[10px] font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded transition-colors"
                      title="Use pre-built sample"
                    >
                      Sample
                    </button>
                    {jobDescription && (
                      <button
                        type="button"
                        onClick={clearJd}
                        className="px-2 py-1 text-[10px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded ml-auto transition-colors"
                        title="Clear job description"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    {/* Textarea */}
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste details of the role here... (or click Sample to auto-populate relative to your chosen title)"
                      className="w-full flex-1 p-3 bg-slate-950/60 border border-white/10 rounded-2xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-all font-sans leading-relaxed resize-none min-h-[160px]"
                    />

                    {/* Drag-and-drop file supporting area */}
                    {!jobDescription && (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsJdDragActive(true); }}
                        onDragLeave={() => setIsJdDragActive(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsJdDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            await handleJdFile(e.dataTransfer.files[0]);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center mt-3 transition-all cursor-pointer ${
                          isJdDragActive
                            ? "border-purple-400 bg-purple-500/5"
                            : "border-white/5 bg-slate-950/15 hover:border-white/10 hover:bg-slate-950/30"
                        }`}
                      >
                        <input
                          type="file"
                          id="jd-upload-match"
                          className="hidden"
                          accept=".txt,.pdf,.docx"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              await handleJdFile(e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="jd-upload-match" className="cursor-pointer flex flex-col items-center">
                          <Upload size={14} className="text-purple-400 mb-1 animate-pulse" />
                          <span className="text-[10px] font-semibold text-slate-300">Or drag standard files here</span>
                        </label>
                      </div>
                    )}

                    {jdFileName && (
                      <div className="mt-3 px-3 py-1.5 bg-purple-500/5 border border-purple-500/10 rounded-xl flex items-center justify-between text-[11px] text-purple-300">
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText size={12} className="shrink-0" />
                          <span className="truncate">{jdFileName}</span>
                          <span className="text-[9px] text-slate-500 shrink-0">({formatBytes(jdFileSize)})</span>
                        </div>
                        <button onClick={() => { setJdFileName(""); setJdFileSize(null); }} className="text-slate-400 hover:text-white">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Error messaging */}
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-xs font-semibold flex items-start gap-3 shadow-[0_4px_20px_rgba(244,63,94,0.05)]">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Extraction or matching failed</p>
                  <p className="text-slate-400 font-medium mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Big Action Button Row */}
            <div className="flex justify-center mt-4">
              <button
                disabled={!resumeText.trim() || (!jobDescription.trim() && !selectedRole.trim())}
                onClick={runJobMatchAnalysis}
                className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 ${
                  resumeText.trim() && (jobDescription.trim() || selectedRole.trim())
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_4px_25px_rgba(99,102,241,0.35)] cursor-pointer hover:scale-[1.02] hover:shadow-[0_4px_30px_rgba(168,85,247,0.5)] active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                <Sparkles size={16} className="text-amber-300" />
                Analyze Job Match
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Part 10: Analysis History & Match Board */}
            {matchHistory.length > 0 && (
              <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden bg-slate-900/10 mt-8">
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <History size={16} className="text-indigo-400" />
                    Targeting Audit History & Comparisons
                  </h3>
                  {comparisonIds.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => setIsComparisonOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center gap-2 animate-pulse"
                    >
                      <Sparkles size={13} />
                      Compare {comparisonIds.length} Matches
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchHistory.map((item) => {
                    const isChecked = comparisonIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setMatchResult(item.result);
                          setJobDescription(item.jobDescription || "");
                          setSelectedRole(item.role);
                          setTargetRoleInput(item.role);
                          if (item.jobPreferences) {
                            setJobPreferences(item.jobPreferences);
                          }
                        }}
                        className="p-4 bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all cursor-pointer group relative flex flex-col justify-between"
                      >
                        <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setComparisonIds(p => [...p, item.id]);
                              } else {
                                setComparisonIds(p => p.filter(id => id !== item.id));
                              }
                            }}
                            className="w-3.5 h-3.5 accent-indigo-500 rounded border-white/10"
                            title="Select for Comparison"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = matchHistory.filter(h => h.id !== item.id);
                              setMatchHistory(updated);
                              localStorage.setItem("resume_iq_job_match_history", JSON.stringify(updated));
                              setComparisonIds(p => p.filter(id => id !== item.id));
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-slate-200 truncate pr-16">{item.role}</span>
                          </div>
                          {item.company && (
                            <span className="text-[10px] text-slate-400 font-semibold block">{item.company}</span>
                          )}
                          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">Used: {item.resumeUsed}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3 mt-3">
                          <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                            item.matchScore >= 85 ? "bg-emerald-500/10 text-emerald-400" :
                            item.matchScore >= 60 ? "bg-amber-500/10 text-amber-400" :
                            "bg-rose-500/10 text-rose-400"
                          }`}>
                            {item.matchScore}% Score
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             =========================== RESULTS DASHBOARD ===========================
             ========================================================================= */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Quick Navigation / Tab Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-white/5 print:hidden">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "overview"
                      ? "bg-indigo-500 text-white shadow-[0_2px_10px_rgba(99,102,241,0.2)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Match Overview
                </button>
                <button
                  onClick={() => setActiveTab("keywords")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "keywords"
                      ? "bg-indigo-500 text-white shadow-[0_2px_10px_rgba(99,102,241,0.2)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Keyword Highlighter
                </button>
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "roadmap"
                      ? "bg-indigo-500 text-white shadow-[0_2px_10px_rgba(99,102,241,0.2)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Learning Roadmap & Milestones
                </button>
                <button
                  onClick={() => setActiveTab("recruiter")}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    activeTab === "recruiter"
                      ? "bg-indigo-500 text-white shadow-[0_2px_10px_rgba(99,102,241,0.2)]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Hiring Manager Assessment
                </button>
              </div>

              <button
                onClick={() => {
                  setMatchResult(null);
                  setSelectedRole("");
                  setTargetRoleInput("");
                  setJobPreferences({
                    preferredLocation: "",
                    experienceLevel: "",
                    employmentType: "",
                    industry: "",
                    salaryExpectation: ""
                  });
                }}
                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-white/10"
              >
                <RefreshCw size={13} />
                New Match Audit
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Score Section & ATS Status */}
                  <div className="md:col-span-4 flex flex-col gap-6">
                    
                    {/* circular match score card */}
                    <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
                        Match Score
                      </h3>

                      <div className="relative flex items-center justify-center w-40 h-40">
                        {/* SVG Circle Progress */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="68"
                            className="stroke-slate-800"
                            strokeWidth="8"
                            fill="transparent"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="68"
                            className={`transition-all duration-1000 ${
                              matchResult.match_score >= 85
                                ? "stroke-emerald-400"
                                : matchResult.match_score >= 60
                                ? "stroke-amber-400"
                                : "stroke-rose-500"
                            }`}
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 68}
                            strokeDashoffset={2 * Math.PI * 68 * (1 - matchResult.match_score / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        {/* Display Score inside circle */}
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-4xl font-extrabold text-white tracking-tight">
                            {matchResult.match_score}%
                          </span>
                          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-0.5">
                            ATS Score
                          </span>
                        </div>
                      </div>

                      {/* ATS Compatibility Title */}
                      <div className="mt-5 w-full">
                        <div className="text-xs font-semibold text-slate-400">ATS Compatibility</div>
                        <div className={`text-xl font-extrabold mt-1 uppercase tracking-wide ${
                          matchResult.ats_compatibility === "Excellent" ? "text-emerald-400" :
                          matchResult.ats_compatibility === "Good" ? "text-teal-400" :
                          matchResult.ats_compatibility === "Average" ? "text-amber-400" : "text-rose-400"
                        }`}>
                          {matchResult.ats_compatibility}
                        </div>
                      </div>
                    </div>

                    {/* Interview Probability Card */}
                    <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                      <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Flame size={14} className="text-orange-400" />
                        Interview Probability
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl text-sm font-extrabold uppercase tracking-wider ${
                          matchResult.interview_probability === "High" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          matchResult.interview_probability === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {matchResult.interview_probability} Fit
                        </div>
                        <div className="text-xs font-bold text-slate-200">
                          Estimated Salary: <span className="text-indigo-400 font-extrabold text-sm block">{matchResult.salary_fit || "Market Level"}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mt-3.5 border-t border-white/5 pt-3.5">
                        Your profile matches critical metrics representing a <span className="text-slate-200 font-semibold">{matchResult.interview_probability?.toLowerCase() || "medium"} fit</span> bracket.
                      </p>
                    </div>

                  </div>

                  {/* Score Breakdown Bars & Skill Gap visualization */}
                  <div className="md:col-span-8 flex flex-col gap-6">
                    
                    {/* Section Scores Bar Charts */}
                    <div className="glass-panel rounded-3xl p-6 border border-white/10">
                      <h3 className="text-sm font-bold text-slate-200 mb-5 flex items-center gap-2">
                        <LineChart size={16} className="text-indigo-400" />
                        ATS Section Audit Score breakdowns
                      </h3>
                      
                      <div className="space-y-4">
                        {Object.entries(matchResult.section_scores || {}).map(([key, rawValue]) => {
                          const value = rawValue as number;
                          return (
                            <div key={key}>
                              <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="capitalize text-slate-300">{key} Compatibility</span>
                                <span className="text-slate-100">{value}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-950/60 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    value >= 85 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                    value >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-400" :
                                    "bg-gradient-to-r from-rose-600 to-pink-500"
                                  }`}
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Skill Gap Visualization */}
                    <div className="glass-panel rounded-3xl p-6 border border-white/10 bg-slate-900/10">
                      <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-indigo-400" />
                        Target Role Skill Gap Visualizer
                      </h3>
                      <div className="space-y-3.5">
                        {matchResult.skill_gaps && matchResult.skill_gaps.length > 0 ? (
                          matchResult.skill_gaps.map((item, idx) => {
                            const isMatched = item.gap <= 15;
                            const isCritical = item.gap >= 40 && item.required >= 70;
                            return (
                              <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <span className="text-slate-200">{item.skill}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-400">Current: {item.current}%</span>
                                    <span className="text-[10px] text-indigo-300 font-bold">Required: {item.required}%</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                      isMatched ? "bg-emerald-500/10 text-emerald-400" :
                                      isCritical ? "bg-rose-500/10 text-rose-400 animate-pulse" :
                                      "bg-amber-500/10 text-amber-400"
                                    }`}>
                                      {isMatched ? "Aligned" : `-${item.gap}% Gap`}
                                    </span>
                                  </div>
                                </div>
                                <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                  {/* Required Level */}
                                  <div
                                    className="absolute top-0 bottom-0 left-0 bg-indigo-500/20 border-r border-indigo-400/50"
                                    style={{ width: `${item.required}%` }}
                                  />
                                  {/* Current Level */}
                                  <div
                                    className={`absolute top-0 bottom-0 left-0 rounded-full ${
                                      isMatched ? "bg-emerald-400" :
                                      isCritical ? "bg-rose-500" :
                                      "bg-amber-400"
                                    }`}
                                    style={{ width: `${item.current}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          // Fallback dynamic generator using match metrics
                          (matchResult.missing_skills || []).slice(0, 4).map((skill, idx) => (
                            <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-200">{skill}</span>
                                <span className="text-[10px] text-rose-400 font-bold uppercase bg-rose-500/10 px-2 py-0.5 rounded">Critical Gap</span>
                              </div>
                              <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div className="absolute top-0 bottom-0 left-0 bg-indigo-500/20 w-[85%]" />
                                <div className="absolute top-0 bottom-0 left-0 bg-rose-500 w-[20%]" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10 bg-slate-900/40">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-300" />
                    AI Career Co-Pilot Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => navigate("/rewriter")}
                      className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-bold text-xs flex flex-col items-center justify-center text-center gap-2 cursor-pointer shadow-lg active:scale-95 border-0"
                    >
                      <Sparkles size={18} className="text-amber-300" />
                      <span>Optimize Resume Bullets</span>
                      <span className="text-[10px] text-white/70 font-normal">Rewrite specific experience points</span>
                    </button>

                    <button
                      onClick={handleGenerateCoverLetter}
                      className="p-4 bg-slate-950/60 hover:bg-slate-950/90 border border-white/10 rounded-2xl transition-all font-bold text-xs flex flex-col items-center justify-center text-center gap-2 cursor-pointer active:scale-95 text-slate-200"
                    >
                      <FileText size={18} className="text-indigo-400" />
                      <span>Tailor Custom Cover Letter</span>
                      <span className="text-[10px] text-slate-400 font-normal">Generate matching intro pitch</span>
                    </button>

                    <button
                      onClick={handleGenerateInterviewPrep}
                      className="p-4 bg-slate-950/60 hover:bg-slate-950/90 border border-white/10 rounded-2xl transition-all font-bold text-xs flex flex-col items-center justify-center text-center gap-2 cursor-pointer active:scale-95 text-slate-200"
                    >
                      <FileQuestion size={18} className="text-purple-400" />
                      <span>Prepare Interview Questions</span>
                      <span className="text-[10px] text-slate-400 font-normal">Generate custom questions & tips</span>
                    </button>

                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="p-4 bg-slate-950/60 hover:bg-slate-950/90 border border-white/10 rounded-2xl transition-all font-bold text-xs flex flex-col items-center justify-center text-center gap-2 cursor-pointer active:scale-95 text-slate-200"
                    >
                      <FileDown size={18} className="text-emerald-400" />
                      <span>Export Match Report</span>
                      <span className="text-[10px] text-slate-400 font-normal">Print standard compliance details</span>
                    </button>
                  </div>
                </div>

                {/* Role Insights Grid */}
                {matchResult.role_insights && (
                  <div className="glass-panel rounded-3xl p-6 border border-white/10">
                    <h3 className="text-sm font-bold text-slate-200 mb-5 flex items-center gap-2">
                      <Compass size={16} className="text-indigo-400" />
                      AI Target Role Insights Grid
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {/* Cell 1: Overview */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Role Overview</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{matchResult.role_insights.role_overview || "No overview available."}</p>
                      </div>

                      {/* Cell 2: Skills Needed */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Average Skills Required</span>
                        {renderInsightsList(matchResult.role_insights.average_required_skills)}
                      </div>

                      {/* Cell 3: Readiness */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Readiness</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-semibold">{matchResult.role_insights.current_readiness || "Evaluating match compatibility."}</p>
                      </div>

                      {/* Cell 4: Top Missing */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Top Missing Skills</span>
                        {renderInsightsList(matchResult.role_insights.top_missing_skills)}
                      </div>

                      {/* Cell 5: Important Tech */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Important Technologies</span>
                        {renderInsightsList(matchResult.role_insights.most_important_technologies)}
                      </div>

                      {/* Cell 6: Typical Responsibilities */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Typical Responsibilities</span>
                        {renderInsightsList(matchResult.role_insights.typical_responsibilities)}
                      </div>

                      {/* Cell 7: Learning Priority */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Learning Priority</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{matchResult.role_insights.learning_priority || "Address critical gaps."}</p>
                      </div>

                      {/* Cell 8: Career Growth */}
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Career Growth / Outlook</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{matchResult.role_insights.career_growth || "Strong market growth forecasted."}</p>
                      </div>

                    </div>
                  </div>
                )}

                {/* Legacy Skills Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Matching Skills Box */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/10 bg-slate-900/10 flex flex-col">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3.5 border-b border-white/5 pb-2.5">
                      <CheckCircle size={15} />
                      Matching Skills ({matchResult.matching_skills?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-1 content-start">
                      {matchResult.matching_skills && matchResult.matching_skills.length > 0 ? (
                        matchResult.matching_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold italic">No direct matching skills detected.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills Box */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/10 bg-slate-900/10 flex flex-col">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-3.5 border-b border-white/5 pb-2.5">
                      <AlertTriangle size={15} />
                      Missing Skills ({matchResult.missing_skills?.length || 0})
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-1 content-start">
                      {matchResult.missing_skills && matchResult.missing_skills.length > 0 ? (
                        matchResult.missing_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-500/5 text-rose-300 border border-rose-500/20"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold">Perfect! No critical skills missing.</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Gaps: Tools, Hard & Soft Skills */}
                <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                  
                  {/* Required Tools Box */}
                  <div className="glass-panel rounded-2xl p-5 border border-white/5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Layers size={13} className="text-indigo-400" />
                      Required Tools & Tech
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.required_tools?.map((tool, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold font-mono rounded bg-slate-950/60 text-slate-300 border border-white/5">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hard Skills Required Box */}
                  <div className="glass-panel rounded-2xl p-5 border border-white/5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Award size={13} className="text-indigo-400" />
                      Required Hard Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.hard_skills?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold font-mono rounded bg-indigo-500/5 text-indigo-300 border border-indigo-500/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Soft Skills Required Box */}
                  <div className="glass-panel rounded-2xl p-5 border border-white/5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Zap size={13} className="text-indigo-400" />
                      Soft Skills Gaps
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.soft_skills?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold font-mono rounded bg-purple-500/5 text-purple-300 border border-purple-500/10">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
            {/* TAB 2: KEYWORD HIGHLIGHTER */}
            {activeTab === "keywords" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Side listing of keyword statistics */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Heatmap Card or Stats */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/10 bg-slate-900/15">
                    <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-1.5">
                      <Search size={14} className="text-slate-400" />
                      Keyword Densities
                    </h3>

                    {/* Matched Keywords Grid */}
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 flex items-center justify-between gap-2 mb-2">
                          <span>Matched Keywords ({matchResult.matching_keywords?.length || 0})</span>
                          <CheckCircle size={14} />
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-white/5">
                          {matchResult.matching_keywords?.map((word, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-rose-400 flex items-center justify-between gap-2 mb-2">
                          <span>Missing Keywords ({matchResult.missing_keywords?.length || 0})</span>
                          <AlertTriangle size={14} />
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-2 bg-slate-950/40 rounded-xl border border-white/5">
                          {matchResult.missing_keywords?.map((word, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/5 text-rose-300 rounded border border-rose-500/20">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-3xl">
                    <p className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                      <Sparkles size={14} />
                      Why Keywords Matter
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium mt-1.5">
                      Our parser highlights matching words in <span className="text-emerald-400 font-semibold">green</span> and key missing requirements in <span className="text-rose-400 font-semibold">red</span> inside the pasted job description on the right. Sprinkle those missing words naturally inside your experience bullets.
                    </p>
                  </div>

                </div>

                {/* Large Highlighter Box */}
                <div className="lg:col-span-8">
                  <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3.5 mb-4">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Sparkles size={15} className="text-purple-400 animate-pulse" />
                        Target Job Description Keyword Audit
                      </h3>
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded">
                        Interactive Highlight View
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-950/30 rounded-2xl border border-white/5 custom-scrollbar">
                      {renderHighlightedJd()}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: ROADMAP */}
            {activeTab === "roadmap" && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Milestone tracking header card */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10 bg-slate-900/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                        <Compass className="text-indigo-400" size={20} />
                        12-Week AI-Generated Career Targeting & Learning Roadmap
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        A personalized curriculum built directly from your detected skill gaps to secure the target role.
                      </p>
                    </div>

                    {/* Progress tracking badge */}
                    <div className="px-5 py-3 bg-slate-950/60 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 min-w-[140px]">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                        Overall Milestone Progress
                      </span>
                      <div className="text-xl font-black text-white">
                        {Object.values(completedMilestones).filter(Boolean).length} / 12
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold mt-1">
                        Weeks Completed
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-950/60 rounded-full mt-6 overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${(Object.values(completedMilestones).filter(Boolean).length / 12) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 12-Week Timeline organized into 4 logical phases */}
                <div className="space-y-8">
                  {[
                    {
                      phaseName: "Phase 1: Foundation Building & Skill Bootstrapping",
                      phaseDesc: "Establish a baseline command of critical technical requirements and missing tools.",
                      weeks: [1, 2, 3],
                      milestoneId: "m1",
                      milestoneTitle: "Acquire fundamental missing systems understanding."
                    },
                    {
                      phaseName: "Phase 2: Core Expertise & Hands-On Integration",
                      phaseDesc: "Build structural workflows and integrate key developer platforms.",
                      weeks: [4, 5, 6],
                      milestoneId: "m2",
                      milestoneTitle: "Complete intermediate platform assignments."
                    },
                    {
                      phaseName: "Phase 3: Advanced Implementation & Performance Optimization",
                      phaseDesc: "Scale applications and master advanced architectural patterns.",
                      weeks: [7, 8, 9],
                      milestoneId: "m3",
                      milestoneTitle: "Ship high-throughput pipelines & architecture."
                    },
                    {
                      phaseName: "Phase 4: Capstone Engineering & Interview Preparation",
                      phaseDesc: "Finalize matching portfolio assets and prepare conversational stories.",
                      weeks: [10, 11, 12],
                      milestoneId: "m4",
                      milestoneTitle: "Polish final portfolio & complete mock reviews."
                    }
                  ].map((phase, phaseIdx) => {
                    const completedInPhase = phase.weeks.filter(w => completedMilestones[w]).length;
                    const totalInPhase = phase.weeks.length;
                    const isPhaseComplete = completedInPhase === totalInPhase;

                    return (
                      <div key={phaseIdx} className="space-y-4">
                        {/* Phase Header */}
                        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                          <div>
                            <h4 className="text-sm font-extrabold text-indigo-300 uppercase tracking-wider">
                              {phase.phaseName}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {phase.phaseDesc}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            isPhaseComplete
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-slate-950/40 text-slate-400 border-white/5"
                          }`}>
                            {completedInPhase} / {totalInPhase} Milestones Done
                          </div>
                        </div>

                        {/* Week list in Phase */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {phase.weeks.map((weekNum) => {
                            // Dynamically align missing skills to specific weeks
                            const skillList = matchResult.missing_skills || [];
                            const associatedSkill = skillList[(weekNum - 1) % Math.max(1, skillList.length)] || "System Architecture";
                            const isCompleted = !!completedMilestones[weekNum];

                            // Generate realistic titles, objectives and action items
                            const weekDetails = {
                              title: `Week ${weekNum}: Mastering ${associatedSkill}`,
                              hours: weekNum % 2 === 0 ? 12 : 15,
                              objective: `Establish practical fluency and implement a micro-project using ${associatedSkill}.`,
                              actions: [
                                `Complete foundational certification module for ${associatedSkill}.`,
                                `Build and deploy a local sandbox project showcasing ${associatedSkill} capabilities.`,
                                `Document technical trade-offs and optimize execution times.`
                              ]
                            };

                            return (
                              <div
                                key={weekNum}
                                className={`glass-panel rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                                  isCompleted
                                    ? "bg-emerald-950/5 border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.02)]"
                                    : "bg-slate-950/20 border-white/5 hover:border-white/10"
                                }`}
                              >
                                {isCompleted && (
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                                )}

                                <div className="space-y-4">
                                  {/* Week Header */}
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h5 className={`text-xs font-extrabold tracking-tight ${isCompleted ? "text-slate-400 line-through" : "text-slate-200"}`}>
                                        {weekDetails.title}
                                      </h5>
                                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                                        Estimated Hours: <span className="text-indigo-400 font-extrabold">{weekDetails.hours} hrs</span>
                                      </span>
                                    </div>

                                    {/* Action Checkbox */}
                                    <button
                                      onClick={() => setCompletedMilestones(prev => ({
                                        ...prev,
                                        [weekNum]: !prev[weekNum]
                                      }))}
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${
                                        isCompleted
                                          ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                          : "bg-slate-900 border-white/10 hover:border-indigo-400 text-transparent"
                                      }`}
                                    >
                                      <Check size={12} className="stroke-[3]" />
                                    </button>
                                  </div>

                                  {/* Objectives */}
                                  <div className="space-y-1.5 border-t border-white/5 pt-3">
                                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Weekly Objective</span>
                                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                                      {weekDetails.objective}
                                    </p>
                                  </div>

                                  {/* Action Items List */}
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Action Items Checklist</span>
                                    <ul className="space-y-1.5">
                                      {weekDetails.actions.map((act, actIdx) => (
                                        <li key={actIdx} className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-normal">
                                          <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                          <span className={isCompleted ? "line-through text-slate-500" : ""}>{act}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>

                                {/* Bottom card footer */}
                                <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[9px] text-slate-500 font-bold">
                                  <span>STATUS</span>
                                  <span className={isCompleted ? "text-emerald-400" : "text-amber-500"}>
                                    {isCompleted ? "COMPLETED" : "PENDING"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Phrasing Suggestions Box from Original Feature (PRESERVED) */}
                <div className="glass-panel rounded-3xl p-6 border border-white/10 bg-slate-950/20">
                  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">Continuous Resume Optimization recommendations</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Incorporate metrics to your bullets using Google's X-Y-Z formula. Apply and copy them below.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {matchResult.priority_improvements?.map((improvement, index) => {
                      const isApplied = appliedImprovements[index];
                      return (
                        <div key={index} className="p-5 bg-slate-950/40 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-start justify-between gap-5 relative group overflow-hidden">
                          {/* Priority Indicator Line */}
                          <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                            improvement.priority === "High" ? "bg-rose-500" :
                            improvement.priority === "Medium" ? "bg-amber-500" :
                            "bg-indigo-400"
                          }`} />

                          <div className="space-y-4 flex-1 min-w-0 pl-1.5">
                            {/* Line header */}
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                                improvement.priority === "High" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                improvement.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              }`}>
                                {improvement.priority} Priority
                              </span>
                              <span className="text-[11px] font-medium text-slate-500 italic">
                                Reason: {improvement.reason}
                              </span>
                            </div>

                            {/* Bullet comparators */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 relative">
                                <span className="absolute top-1.5 right-2 text-[9px] font-bold text-rose-400 uppercase font-mono tracking-wider">
                                  Current Resume
                                </span>
                                <p className="text-xs text-slate-400 font-mono leading-relaxed line-through decoration-rose-500/50 pr-8">
                                  {improvement.original || "Weak generalized bullet point."}
                                </p>
                              </div>

                              <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 relative">
                                <span className="absolute top-1.5 right-2 text-[9px] font-bold text-emerald-400 uppercase font-mono tracking-wider">
                                  Tailored Fix
                                </span>
                                <p className="text-xs text-slate-200 font-mono font-medium leading-relaxed pr-8">
                                  {improvement.optimized}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex md:self-center shrink-0">
                            <button
                              onClick={() => applyImprovement(index, improvement.optimized)}
                              className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                                isApplied
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 flex items-center justify-center gap-1.5"
                                  : "bg-indigo-500 text-white hover:bg-indigo-600 cursor-pointer shadow-lg active:scale-95"
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check size={14} />
                                  Ready to Copy
                                </>
                              ) : (
                                "Apply & Copy"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
            {/* TAB 4: RECRUITER ASSESSMENT */}
            {activeTab === "recruiter" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Simulated Recruiter card */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* Hiring Manager Summary */}
                  <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-lg">
                          HM
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">Recruiter Audit Narrative</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Authoritative hiring team screening preview</p>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        matchResult.ats_compatibility === "Excellent" || matchResult.ats_compatibility === "Good"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        Decision: {matchResult.ats_compatibility === "Excellent" || matchResult.ats_compatibility === "Good" ? "Shortlist Recommended" : "Requires Re-optimization"}
                      </div>
                    </div>

                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-serif italic p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                      "{matchResult.hiring_manager_summary || "Based on the comparison, candidate exhibits reasonable alignment with core prerequisites but requires direct rephrasing of cloud systems experience."}"
                    </div>
                  </div>

                  {/* Tailored Profile Summary for pasting */}
                  <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3.5 mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">Optimized Resume Profile Summary</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Copy-paste this premium bio directly at the top of your resume.</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(matchResult.optimized_summary || "");
                          setCopiedText("summary");
                          setTimeout(() => setCopiedText(null), 2000);
                        }}
                        className="text-xs px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition-colors shadow-md"
                      >
                        {copiedText === "summary" ? "Copied!" : "Copy Summary"}
                      </button>
                    </div>

                    <p className="text-xs font-mono font-medium text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5">
                      {matchResult.optimized_summary || "Result-driven Senior Specialist with expertise in technical matching alignments."}
                    </p>
                  </div>

                </div>

                {/* Gaps Checklist & Gaps listing */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  
                  {/* Strengths / Weaknesses Checklist */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/10 bg-slate-900/10">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" />
                      Biggest Gaps & Areas
                    </h4>
                    <ul className="space-y-3">
                      {matchResult.resume_weaknesses?.map((weakness, i) => (
                        <li key={i} className="text-xs text-slate-300 font-medium leading-relaxed flex items-start gap-2.5 bg-slate-950/30 p-2.5 rounded-xl border border-white/5">
                          <AlertTriangle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Highlights Summary */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/10 bg-slate-900/10">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5 border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <Award size={14} className="text-indigo-400" />
                      Notable Highlights
                    </h4>
                    <ul className="space-y-3">
                      {matchResult.resume_strengths?.map((strength, i) => (
                        <li key={i} className="text-xs text-slate-300 font-medium leading-relaxed flex items-start gap-2.5 bg-slate-950/30 p-2.5 rounded-xl border border-white/5">
                          <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>
            )}

            {/* Print-Only Report Layout */}
            <div className="hidden print:block bg-white text-slate-900 p-8 space-y-8 font-sans">
              <div className="border-b-2 border-slate-900 pb-4">
                <h1 className="text-2xl font-black uppercase tracking-tight">CareerOS - Job Match Audit Report</h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Premium Candidate Match Assessment Report</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">Match score</p>
                  <p className="text-4xl font-black text-slate-900">{matchResult.match_score}%</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">ATS compatibility</p>
                  <p className="text-xl font-bold text-indigo-700">{matchResult.ats_compatibility}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b border-slate-300 pb-1 uppercase tracking-wider">Hiring Manager screening</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-serif italic">"{matchResult.hiring_manager_summary}"</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold border-b border-slate-300 pb-1 uppercase tracking-wider">Matching Skills</h3>
                  <ul className="list-disc list-inside text-xs text-slate-700 mt-2 space-y-1">
                    {matchResult.matching_skills?.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold border-b border-slate-300 pb-1 uppercase tracking-wider">Missing Skills & Keywords</h3>
                  <ul className="list-disc list-inside text-xs text-slate-700 mt-2 space-y-1">
                    {matchResult.missing_skills?.map((s, idx) => <li key={idx}>{s}</li>)}
                    {matchResult.missing_keywords?.map((k, idx) => <li key={idx}>Keyword Gaps: {k}</li>)}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold border-b border-slate-300 pb-1 uppercase tracking-wider">Optimized Phrasing Suggestions</h3>
                <div className="space-y-3">
                  {matchResult.priority_improvements?.map((imp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
                      <p className="font-bold text-slate-500">Current: <span className="line-through decoration-slate-400 font-mono font-medium">{imp.original}</span></p>
                      <p className="font-bold text-indigo-700">Recommended: <span className="font-mono font-semibold">{imp.optimized}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* COVER LETTER MODAL */}
      {isCoverLetterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1020]/80 backdrop-blur-sm px-4">
          <div className="max-w-2xl w-full glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden bg-slate-900/95 animate-fadeIn">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-400" size={20} />
                <h3 className="text-lg font-bold text-white">AI-Tailored Cover Letter</h3>
              </div>
              <button
                onClick={() => setIsCoverLetterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-[300px]">
              {isGeneratingCoverLetter ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
                  </div>
                  <p className="text-xs font-bold text-indigo-400">Synthesizing personalized pitch...</p>
                  <p className="text-[10px] text-slate-500 mt-1">Analyzing alignment with target requirements</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed selection:bg-indigo-500/30">
                      {coverLetterText}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!isGeneratingCoverLetter && (
              <div className="p-6 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3">
                <button
                  onClick={() => setIsCoverLetterOpen(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetterText);
                    setCopiedText("coverLetter");
                    setTimeout(() => setCopiedText(null), 2000);
                  }}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
                >
                  <Copy size={13} />
                  {copiedText === "coverLetter" ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INTERVIEW PREP MODAL */}
      {isInterviewPrepOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1020]/80 backdrop-blur-sm px-4">
          <div className="max-w-3xl w-full glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden bg-slate-900/95 animate-fadeIn">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileQuestion className="text-purple-400" size={20} />
                <h3 className="text-lg font-bold text-white">Custom Interview Prep Kit</h3>
              </div>
              <button
                onClick={() => setIsInterviewPrepOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar min-h-[300px]">
              {isGeneratingInterviewPrep ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="relative flex items-center justify-center w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
                  </div>
                  <p className="text-xs font-bold text-purple-400">Formulating interview blueprint...</p>
                  <p className="text-[10px] text-slate-500 mt-1">Generating custom talking points for target gaps</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {interviewPrepData.length > 0 ? (
                    interviewPrepData.map((item, idx) => (
                      <div key={idx} className="p-5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-4">
                        <div className="flex gap-2.5">
                          <span className="w-5 h-5 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 leading-normal">{item.question}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-3.5 mt-2">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">Recommended Strategy</span>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.strategy}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Suggested Talking Points</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{item.answer}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-8">Failed to load interview guidelines. Please try again.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-slate-950/40 flex justify-end">
              <button
                onClick={() => setIsInterviewPrepOpen(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MATCHING AI LOADER SCREEN */}
      {isMatching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1020]/95 backdrop-blur-md px-4 select-none">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-white/10 text-center relative overflow-hidden shadow-2xl flex flex-col items-center">
            {/* Spinning gradient ring */}
            <div className="relative flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-600 animate-spin" />
              <Sparkles size={28} className="text-indigo-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-extrabold text-white tracking-tight">Evaluating Job Compatibility</h3>
            <p className="text-xs text-slate-400 font-medium mt-1.5">This takes 5-10 seconds using Gemini 3.5 Flash</p>

            {/* Simulated Checklist that ticks off */}
            <div className="w-full mt-6 space-y-2 text-left">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/5 animate-fadeIn">
                <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Extracting job credentials...</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/5 animate-fadeIn">
                <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Auditing keyword density gap-matrix...</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-white/5 animate-fadeIn">
                <div className="w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                  <Clock size={11} />
                </div>
                <span className="text-xs font-semibold text-indigo-400 animate-pulse">Evaluating career roadmap alignments...</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/15 border border-dashed border-white/5">
                <div className="w-4 h-4 rounded bg-slate-900 border border-white/5 shrink-0" />
                <span className="text-xs font-semibold text-slate-500">Synthesizing Recruiter assessment metrics...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
