/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAnalysis } from "../hooks/useAnalysis";
import { useFileParser } from "../hooks/useFileParser";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  FileText,
  Briefcase,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Plus,
  BookOpen,
  Layers,
  CheckCircle,
  Mic,
  Compass,
  PenTool,
  Upload,
  Clock,
  History as HistoryIcon,
  ChevronRight,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Flame,
  Activity,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
  Sparkle
} from "lucide-react";

export function ResumeStatusBadges({ fileName }: { fileName?: string }) {
  if (!fileName) return null;
  
  const isAI_Optimized = localStorage.getItem("career_os_ai_optimized_" + fileName) === "true" || localStorage.getItem("resume_iq_ai_optimized_" + fileName) === "true";
  const isJobMatched = localStorage.getItem("career_os_job_matched_" + fileName) === "true" || localStorage.getItem("resume_iq_job_matched_" + fileName) === "true";

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 dark:text-indigo-300 text-[10px] font-semibold font-mono">
        Uploaded
      </span>
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 dark:text-purple-300 text-[10px] font-semibold font-mono">
        Parsed
      </span>
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 dark:text-emerald-300 text-[10px] font-semibold font-mono">
        Analyzed
      </span>
      {isAI_Optimized && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 dark:text-amber-300 text-[10px] font-semibold font-mono">
          ✨ AI Optimized
        </span>
      )}
      {isJobMatched && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 dark:text-rose-300 text-[10px] font-semibold font-mono">
          💼 Job Matched
        </span>
      )}
    </div>
  );
}

export default function Workspace() {
  const { currentFile, analysisResult, history, loadFromHistory, isAnalyzing } = useAnalysis();
  const { isDragActive, fileError, handleDragOver, handleDragLeave, handleDrop, handleFileSelect, resetParserState } = useFileParser();
  const navigate = useNavigate();

  // Local state for stats and history lists
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [jobMatchHistory, setJobMatchHistory] = useState<any[]>([]);
  const [reportsCount, setReportsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "activities">("overview");

  // Load secondary histories
  useEffect(() => {
    try {
      const savedInterview = localStorage.getItem("resume_iq_interview_coach_history");
      if (savedInterview) {
        setInterviewHistory(JSON.parse(savedInterview));
      }
    } catch (err) {
      console.error("Failed to load interview history:", err);
    }

    try {
      const savedJobMatch = localStorage.getItem("resume_iq_job_match_history");
      if (savedJobMatch) {
        setJobMatchHistory(JSON.parse(savedJobMatch));
      }
    } catch (err) {
      console.error("Failed to load job match history:", err);
    }
  }, []);

  // Compute reports generated based on history & localStorage
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem("resume_iq_reports_generated_count");
      if (savedCount) {
        setReportsCount(parseInt(savedCount) || 0);
      } else {
        const count = history.length > 0 ? Math.min(history.length, 2) : 0;
        setReportsCount(count);
      }
    } catch {}
  }, [history]);

  // Compute active variables
  const totalResumes = Array.from(new Set(history.map(item => item.fileName))).length || (currentFile ? 1 : 0);
  const totalAnalyses = history.length || (currentFile ? 1 : 0);
  const totalInterviews = interviewHistory.length;
  const totalReports = reportsCount;

  // Active file metrics
  const activeJobMatch = currentFile
    ? jobMatchHistory.find(h => h.resumeUsed === currentFile.name || h.fileName === currentFile.name)
    : null;
  const jobMatchScore = activeJobMatch ? activeJobMatch.matchScore : null;

  const latestInterview = interviewHistory.length > 0 ? interviewHistory[0] : null;
  const interviewScore = latestInterview ? latestInterview.score : null;
  
  const isAI_Optimized = currentFile
    ? localStorage.getItem("career_os_ai_optimized_" + currentFile.name) === "true" ||
      localStorage.getItem("resume_iq_ai_optimized_" + currentFile.name) === "true"
    : false;

  const handleLoadItem = (id: string) => {
    loadFromHistory(id);
    navigate("/dashboard");
  };

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const scrollToQuickActions = () => {
    document.getElementById("quick-actions-section")?.scrollIntoView({ behavior: "smooth" });
  };

  // Compile Quick Actions
  const quickActions = [
    {
      title: "Analyze Resume",
      description: "Run 27 AI compliance audits on PDF or Word text layers",
      icon: FileText,
      path: "/analyzer",
      color: "border-indigo-500/10 hover:border-indigo-500/40 text-indigo-500"
    },
    {
      title: "AI Resume Rewriter",
      description: "Instantly rephrase experience bullets to corporate voice standards",
      icon: Sparkles,
      onClick: () => {
        if (currentFile) {
          localStorage.setItem("career_os_auto_optimize_trigger", "true");
          localStorage.setItem("resume_iq_auto_optimize_trigger", "true");
          navigate("/rewriter", { state: { autoOptimize: true } });
        } else {
          navigate("/analyzer");
        }
      },
      color: "border-purple-500/10 hover:border-purple-500/40 text-purple-500",
      badge: currentFile ? "✨ Premium Unlocked" : "Requires Resume"
    },
    {
      title: "Job Match",
      description: "Compare resume alignment with custom job descriptions",
      icon: Compass,
      path: "/job-match",
      color: "border-emerald-500/10 hover:border-emerald-500/40 text-emerald-500"
    },
    {
      title: "Interview Coach",
      description: "Simulate tailored Q&As and voice practice sessions",
      icon: Mic,
      path: "/interview-coach",
      color: "border-amber-500/10 hover:border-amber-500/40 text-amber-500"
    },
    {
      title: "Bullet Optimizer",
      description: "Optimize single bullet points using Google's X-Y-Z formula",
      icon: PenTool,
      path: "/improve",
      color: "border-rose-500/10 hover:border-rose-500/40 text-rose-500"
    },
    {
      title: "Generate Report",
      description: "Download detailed ATS scoring review and PDF summary",
      icon: TrendingUp,
      path: "/reports",
      color: "border-sky-500/10 hover:border-sky-500/40 text-sky-500"
    }
  ];

  // Dynamic recommendations based on actual state
  const getRecommendations = () => {
    const list = [];
    if (!currentFile) {
      list.push({
        title: "Analyze Your Resume Draft",
        desc: "Upload your resume in PDF or Word format to receive real-time ATS scoring and customized improvement recommendations.",
        actionText: "Upload Resume",
        icon: FileText,
        onClick: () => navigate("/analyzer"),
        tag: "High Priority"
      });
      list.push({
        title: "Practice Mock Interview",
        desc: "Build professional confidence by simulating a general engineering or product management conversation with AI.",
        actionText: "Start Prep",
        icon: Mic,
        onClick: () => navigate("/interview-coach"),
        tag: "Career Ready"
      });
    } else {
      const score = analysisResult?.scores.overall || 0;
      if (score < 75) {
        list.push({
          title: "Improve Resume Core Score",
          desc: "Your overall ATS score is currently below 75%. Fix critical formatting issues, section titles, or contact info to bypass legacy parser limits.",
          actionText: "View Scoring Details",
          icon: AlertCircle,
          onClick: () => navigate("/dashboard"),
          tag: "Critical Audit"
        });
      }
      
      const contentScore = analysisResult?.scores.content?.score || 100;
      if (contentScore < 80) {
        list.push({
          title: "Rewrite Core Work Achievements",
          desc: "Our McKinsey quantification audit indicates you should add more metrics (savings, headcount, conversions) to your experience.",
          actionText: "Rewrite with AI",
          icon: Sparkles,
          onClick: () => {
            localStorage.setItem("career_os_auto_optimize_trigger", "true");
            localStorage.setItem("resume_iq_auto_optimize_trigger", "true");
            navigate("/rewriter", { state: { autoOptimize: true } });
          },
          tag: "Impact Focus"
        });
      }

      if (!jobMatchScore) {
        list.push({
          title: "Check Target Job Match Rate",
          desc: "You haven't run a job description analysis on your active resume. Check your keyword density match for target roles.",
          actionText: "Compare with JD",
          icon: Compass,
          onClick: () => navigate("/job-match"),
          tag: "Role Alignment"
        });
      } else if (jobMatchScore < 80) {
        list.push({
          title: "Optimize Resume for Job Fit",
          desc: `Your job match score is ${jobMatchScore}%. Incorporate missing skills highlighted by the JD model to increase resume selection chances.`,
          actionText: "Optimize Keywords",
          icon: Compass,
          onClick: () => navigate("/job-match"),
          tag: "High Impact"
        });
      }

      if (totalInterviews === 0) {
        list.push({
          title: "Complete Interview Practice Session",
          desc: "Tailored interview prep is unlocked! Practice speaking or typing responses to questions generated directly from your experience.",
          actionText: "Launch Coach",
          icon: Mic,
          onClick: () => navigate("/interview-coach"),
          tag: "Practice Needed"
        });
      }

      if (totalReports === 0) {
        list.push({
          title: "Generate ATS Compliance Report",
          desc: "Export your overall scoring breakdown, detected keywords, and recommendations into a comprehensive PDF report.",
          actionText: "Export PDF",
          icon: TrendingUp,
          onClick: () => navigate("/reports"),
          tag: "Compliance Documentation"
        });
      }
    }

    // Default recommendation if all clean
    if (list.length === 0) {
      list.push({
        title: "Keep Up the Stellar Work!",
        desc: "Your active resume is fully optimized and matched with high scoring alignment across the suite modules.",
        actionText: "Run Another Analysis",
        icon: Award,
        onClick: () => navigate("/analyzer"),
        tag: "All Clear"
      });
    }

    return list.slice(0, 2); // Show top 2 recommendations
  };

  // Compile Recent Activity from history and local state
  const getRecentActivity = () => {
    const list: any[] = [];
    
    // Sort history latest first
    const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    sortedHistory.forEach((item, index) => {
      // 1. Analyzed action
      list.push({
        id: `analyzed-${item.id}-${index}`,
        action: "Resume analyzed",
        fileName: item.fileName,
        timestamp: item.timestamp,
        status: "Completed",
        score: `${item.score}%`,
        icon: FileText,
        color: "text-indigo-400 bg-indigo-500/10"
      });

      // 2. Rewritten action
      const optFlag = localStorage.getItem("career_os_ai_optimized_" + item.fileName) === "true" || localStorage.getItem("resume_iq_ai_optimized_" + item.fileName) === "true";
      if (optFlag) {
        list.push({
          id: `rewritten-${item.id}-${index}`,
          action: "Resume rewritten",
          fileName: item.fileName,
          timestamp: new Date(new Date(item.timestamp).getTime() + 5 * 60000).toISOString(), // slightly after
          status: "Success",
          score: "AI Optimised",
          icon: Sparkles,
          color: "text-purple-400 bg-purple-500/10"
        });
      }

      // 3. Matched action
      const matchFlag = localStorage.getItem("career_os_job_matched_" + item.fileName) === "true" || localStorage.getItem("resume_iq_job_matched_" + item.fileName) === "true";
      if (matchFlag) {
        list.push({
          id: `matched-${item.id}-${index}`,
          action: "Job match generated",
          fileName: item.fileName,
          timestamp: new Date(new Date(item.timestamp).getTime() + 10 * 60000).toISOString(),
          status: "Generated",
          score: jobMatchScore ? `${jobMatchScore}% Match` : "Calculated",
          icon: Compass,
          color: "text-emerald-400 bg-emerald-500/10"
        });
      }
    });

    // 4. Completed interview coach sessions
    interviewHistory.forEach((item) => {
      list.push({
        id: `interview-${item.id}`,
        action: "Interview completed",
        fileName: `${item.company} • ${item.role}`,
        timestamp: item.timestamp,
        status: item.badge || "Passed",
        score: `${item.score}%`,
        icon: Mic,
        color: "text-amber-400 bg-amber-500/10"
      });
    });

    // Sort all combined actions by timestamp latest first
    return list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5); // top 5
  };

  const formatActivityTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      if (diffMs < 60000) return "Just now";
      
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const activeActivities = getRecentActivity();
  const activeRecommendations = getRecommendations();

  // Header dynamic information
  const lastUpdatedDate = history.length > 0
    ? new Date(history[0].timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : currentFile ? "Just now" : "N/A";

  const workspaceStatusText = isAnalyzing
    ? "Analyzing..."
    : currentFile
      ? isAI_Optimized
        ? "AI Optimized"
        : "Standard Ready"
      : "Awaiting Upload";

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto pb-12 select-none">
      
      {/* ==========================================
         =================== HEADER =================
         ========================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-brand-border/40 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-brand-text-bright tracking-tight font-display flex items-center gap-2">
            Welcome Back, <span className="text-gradient bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Gautham</span>
          </h1>
          <p className="text-sm text-brand-text-secondary">
            Manage resumes, AI tools, reports and career activities from one workspace.
          </p>
        </div>

        {/* Dynamic Navigation Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-card/60 border border-brand-border text-[11px] font-mono text-brand-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-brand-text-muted mr-1 font-semibold">Active Resume:</span>
            <span className="text-brand-text-bright font-bold truncate max-w-[130px]" title={currentFile?.name || "None"}>
              {currentFile ? currentFile.name : "None"}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-card/60 border border-brand-border text-[11px] font-mono text-brand-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
            <span className="text-brand-text-muted mr-1 font-semibold">Last Updated:</span>
            <span className="text-brand-text-bright font-bold">
              {lastUpdatedDate}
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[11px] font-mono font-bold ${
            isAnalyzing 
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400 animate-pulse"
              : currentFile 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-brand-card/60 border-brand-border text-brand-text-secondary"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? "bg-indigo-400" : currentFile ? "bg-emerald-400" : "bg-slate-400"}`} />
            <span className="text-brand-text-muted mr-1 font-semibold">Workspace Status:</span>
            <span>{workspaceStatusText}</span>
          </div>
        </div>
      </div>

      {/* ==========================================
         =========== CORE CONTENT SWITCHER ==========
         ========================================== */}
      {currentFile ? (
        // ACTIVE STATE: Render Premium Command Center Layout
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Workspace Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ACTIVE RESUME PANEL (Premium Card) */}
            <div className="p-6 rounded-[18px] bg-brand-card border border-brand-border/60 hover:border-brand-border transition-all duration-300 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-300" />
              
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-500 shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-brand-text-bright truncate max-w-[280px]">
                      {currentFile.name}
                    </h3>
                    <p className="text-[11px] text-brand-text-muted font-mono mt-0.5">
                      Size: {formatBytes(currentFile.size)} • {lastUpdatedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    isAI_Optimized 
                      ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                      : "bg-brand-bg border border-brand-border text-brand-text-muted"
                  }`}>
                    {isAI_Optimized ? "✨ AI OPTIMIZED" : "STANDARD PDF"}
                  </span>
                </div>
              </div>

              {/* Advanced Score Matrices */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-brand-bg/50 border border-brand-border/40 rounded-xl mb-6">
                
                {/* Score 1: ATS SCORE */}
                <div className="text-center space-y-1 py-1 relative after:absolute after:top-2 after:bottom-2 after:right-0 after:w-px after:bg-brand-border/40 last:after:hidden">
                  <span className="text-[10px] text-brand-text-muted uppercase tracking-wider font-mono font-bold block">
                    ATS Audit
                  </span>
                  <div className="text-2xl font-bold text-indigo-500 font-mono tracking-tight flex items-baseline justify-center gap-0.5">
                    {analysisResult ? (
                      <>
                        <span>{analysisResult.scores.overall}</span>
                        <span className="text-xs text-brand-text-muted font-normal">/100</span>
                      </>
                    ) : (
                      <span className="text-brand-text-muted">--</span>
                    )}
                  </div>
                  <span className="text-[9px] text-brand-text-secondary font-semibold font-mono block">
                    {analysisResult 
                      ? analysisResult.scores.overall >= 85 
                        ? "Excellent" 
                        : analysisResult.scores.overall >= 70 
                          ? "Good" 
                          : "Needs Improvement"
                      : "Standby"}
                  </span>
                </div>

                {/* Score 2: JOB MATCH SCORE */}
                <div className="text-center space-y-1 py-1 relative after:absolute after:top-2 after:bottom-2 after:right-0 after:w-px after:bg-brand-border/40 last:after:hidden">
                  <span className="text-[10px] text-brand-text-muted uppercase tracking-wider font-mono font-bold block">
                    Job Match
                  </span>
                  <div className="text-2xl font-bold text-emerald-500 font-mono tracking-tight flex items-baseline justify-center gap-0.5">
                    {jobMatchScore !== null ? (
                      <>
                        <span>{jobMatchScore}</span>
                        <span className="text-xs text-brand-text-muted font-normal">%</span>
                      </>
                    ) : (
                      <span className="text-brand-text-muted font-normal text-sm">Not Run</span>
                    )}
                  </div>
                  <span className="text-[9px] text-brand-text-secondary font-semibold font-mono block truncate px-1">
                    {activeJobMatch 
                      ? activeJobMatch.role 
                      : "No Target Role matched"}
                  </span>
                </div>

                {/* Score 3: INTERVIEW READINESS */}
                <div className="text-center space-y-1 py-1">
                  <span className="text-[10px] text-brand-text-muted uppercase tracking-wider font-mono font-bold block">
                    Readiness
                  </span>
                  <div className="text-2xl font-bold text-amber-500 font-mono tracking-tight flex items-baseline justify-center gap-0.5">
                    {interviewScore !== null ? (
                      <>
                        <span>{interviewScore}</span>
                        <span className="text-xs text-brand-text-muted font-normal">%</span>
                      </>
                    ) : (
                      <span className="text-brand-text-muted font-normal text-xs uppercase">Not Practiced</span>
                    )}
                  </div>
                  <span className="text-[9px] text-brand-text-secondary font-semibold font-mono block">
                    {interviewScore !== null 
                      ? interviewScore >= 85 
                        ? "Exceptional" 
                        : interviewScore >= 70 
                          ? "Good Progress" 
                          : "Needs Practice"
                      : "Launch prep"}
                  </span>
                </div>

              </div>

              {/* Panel Action Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-bright rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-colors active:scale-98 duration-150"
                >
                  <FileText size={14} className="text-indigo-500" />
                  <span>View Full Analytics</span>
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem("career_os_auto_optimize_trigger", "true");
                    localStorage.setItem("resume_iq_auto_optimize_trigger", "true");
                    navigate("/rewriter", { state: { autoOptimize: true } });
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-colors active:scale-98 duration-150 shadow-sm shadow-indigo-500/10"
                >
                  <Sparkles size={14} className="text-amber-200" />
                  <span>AI Resume Rewriter</span>
                </button>

                <button
                  onClick={() => navigate("/analyzer")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary rounded-xl font-bold text-xs uppercase tracking-wide cursor-pointer transition-colors active:scale-98 duration-150 shrink-0"
                >
                  <span>Analyze Again</span>
                </button>
              </div>

            </div>

            {/* QUICK ACTIONS TOOLKITS */}
            <div id="quick-actions-section" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-brand-text-bright uppercase tracking-wider font-mono">
                  Quick Actions
                </h3>
                <span className="text-[11px] text-brand-text-muted font-mono">
                  Launch core CareerOS modules
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, idx) => {
                  const IconComp = action.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (action.onClick) {
                          action.onClick();
                        } else if (action.path) {
                          navigate(action.path);
                        }
                      }}
                      className="p-5 rounded-[18px] bg-brand-card border border-brand-border/60 hover:border-brand-border flex gap-4 transition-all duration-200 cursor-pointer relative overflow-hidden group hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-bg/40 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bg border border-brand-border/80 group-hover:border-indigo-500/20 group-hover:scale-105 transition-all duration-200 shrink-0`}>
                        <IconComp size={20} className="text-indigo-500 dark:text-indigo-400" />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1 leading-normal">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="font-bold text-sm text-brand-text-bright truncate group-hover:text-indigo-400 transition-colors duration-150">
                            {action.title}
                          </h4>
                          <span className="p-1 rounded bg-brand-bg border border-brand-border opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                            <ArrowRight size={11} className="text-indigo-400" />
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-text-secondary font-medium leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WORKSPACE OVERVIEW STATS */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-brand-text-bright uppercase tracking-wider font-mono">
                Workspace Overview
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Metric 1: Total Resumes */}
                <div className="p-5 bg-brand-card border border-brand-border/60 hover:border-brand-border rounded-[18px] transition-colors duration-200 space-y-1 shadow-sm">
                  <span className="text-[10px] text-brand-text-muted font-bold font-mono uppercase tracking-wider block">
                    Total Resumes
                  </span>
                  <p className="text-2xl font-bold text-brand-text-bright font-mono">
                    {totalResumes}
                  </p>
                  <p className="text-[10px] text-brand-text-secondary font-medium">
                    Scanned PDF & Word
                  </p>
                </div>

                {/* Metric 2: AI Analyses */}
                <div className="p-5 bg-brand-card border border-brand-border/60 hover:border-brand-border rounded-[18px] transition-colors duration-200 space-y-1 shadow-sm">
                  <span className="text-[10px] text-brand-text-muted font-bold font-mono uppercase tracking-wider block">
                    AI Analyses
                  </span>
                  <p className="text-2xl font-bold text-brand-text-bright font-mono">
                    {totalAnalyses}
                  </p>
                  <p className="text-[10px] text-brand-text-secondary font-medium">
                    Overall Audits Run
                  </p>
                </div>

                {/* Metric 3: Interview Sessions */}
                <div className="p-5 bg-brand-card border border-brand-border/60 hover:border-brand-border rounded-[18px] transition-colors duration-200 space-y-1 shadow-sm">
                  <span className="text-[10px] text-brand-text-muted font-bold font-mono uppercase tracking-wider block">
                    Mock Prep
                  </span>
                  <p className="text-2xl font-bold text-brand-text-bright font-mono">
                    {totalInterviews}
                  </p>
                  <p className="text-[10px] text-brand-text-secondary font-medium">
                    Completed Sessions
                  </p>
                </div>

                {/* Metric 4: Reports Generated */}
                <div className="p-5 bg-brand-card border border-brand-border/60 hover:border-brand-border rounded-[18px] transition-colors duration-200 space-y-1 shadow-sm">
                  <span className="text-[10px] text-brand-text-muted font-bold font-mono uppercase tracking-wider block">
                    PDF Reports
                  </span>
                  <p className="text-2xl font-bold text-brand-text-bright font-mono">
                    {totalReports}
                  </p>
                  <p className="text-[10px] text-brand-text-secondary font-medium">
                    ATS Audit Exports
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Right Workspace Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* NEXT RECOMMENDED ACTION (PRODUCTIVITY SECTION) */}
            <div className="p-5 rounded-[18px] bg-brand-card border border-brand-border/60 hover:border-brand-border shadow-sm space-y-4 transition-colors duration-200">
              <div className="flex items-center gap-2 border-b border-brand-border/40 pb-3">
                <Flame size={15} className="text-amber-500" />
                <h3 className="font-bold text-xs text-brand-text-bright uppercase tracking-widest font-mono">
                  Next Recommended Action
                </h3>
              </div>

              <div className="space-y-4">
                {activeRecommendations.map((rec, idx) => {
                  const RecIcon = rec.icon;
                  return (
                    <div key={idx} className="p-4 bg-brand-bg/50 border border-brand-border/50 rounded-xl space-y-2 relative overflow-hidden group">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-[9px] uppercase tracking-wider">
                          {rec.tag}
                        </span>
                        <RecIcon size={14} className="text-indigo-400 shrink-0" />
                      </div>
                      <h4 className="font-bold text-xs text-brand-text-bright font-sans">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                        {rec.desc}
                      </p>
                      
                      <button
                        onClick={rec.onClick}
                        className="w-full mt-2 inline-flex items-center justify-between text-[11px] font-bold text-[#7C5CFF] hover:text-indigo-400 transition-colors uppercase tracking-wider group/btn"
                      >
                        <span>{rec.actionText}</span>
                        <ArrowRight size={11} className="transform group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT ACTIVITY LOG */}
            <div className="p-5 rounded-[18px] bg-brand-card border border-brand-border/60 hover:border-brand-border shadow-sm space-y-4 transition-colors duration-200">
              <div className="flex items-center gap-2 border-b border-brand-border/40 pb-3">
                <Activity size={15} className="text-indigo-500" />
                <h3 className="font-bold text-xs text-brand-text-bright uppercase tracking-widest font-mono">
                  Recent Activity
                </h3>
              </div>

              {activeActivities.length > 0 ? (
                <div className="space-y-3">
                  {activeActivities.map((act) => {
                    const ActIcon = act.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-3 text-xs border-b border-brand-border/20 last:border-0 pb-3 last:pb-0">
                        <div className={`w-7 h-7 rounded-lg ${act.color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <ActIcon size={14} />
                        </div>
                        <div className="min-w-0 flex-1 leading-snug">
                          <p className="font-bold text-brand-text-bright font-sans">
                            {act.action}
                          </p>
                          <p className="text-[10px] text-brand-text-secondary truncate font-medium mt-0.5">
                            {act.fileName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono font-semibold text-brand-text-muted">
                            <span>{act.status}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><Clock size={10} />{formatActivityTime(act.timestamp)}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-indigo-400 shrink-0">
                          {act.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-[11px] text-brand-text-muted font-medium">
                    No recent activities recorded yet.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        // ==========================================
        // ============ BEAUTIFUL EMPTY STATE ========
        // ==========================================
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="p-8 sm:p-12 rounded-[18px] bg-brand-card border border-brand-border/60 hover:border-brand-border transition-all duration-300 shadow-sm text-center space-y-8 relative overflow-hidden group">
            
            {/* Ambient visual blur nodes */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/8 transition-colors duration-300" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/8 transition-colors duration-300" />
            
            {/* Sleek CSS/SVG Minimalist Illustration of an empty command tray */}
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/5 border border-indigo-500/10 rounded-full scale-90 animate-pulse pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center text-indigo-400 relative z-10 shadow-md">
                <Upload size={28} className="animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF] z-12">
                <Sparkle size={10} />
              </div>
            </div>

            {/* Core empty greeting & user copy */}
            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-text-bright tracking-tight font-display">
                Initialize Your CareerOS Command Center
              </h2>
              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
                Unlock real-time ATS compliance analytics, McKinsey achievement optimization, customized target job matches, and professional AI speech interview preparation.
              </p>
            </div>

            {/* Interactive File Select & Drag-and-Drop Uploader */}
            <div className="max-w-md mx-auto space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-150 cursor-pointer ${
                  isDragActive
                    ? "border-indigo-400 bg-indigo-500/5 scale-[1.01]"
                    : "border-brand-border/80 bg-brand-bg/40 hover:border-[#7C5CFF]/30 hover:bg-brand-bg/80"
                }`}
              >
                <input
                  type="file"
                  id="workspace-empty-file-picker"
                  className="hidden"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileSelect}
                />
                <label htmlFor="workspace-empty-file-picker" className="cursor-pointer block space-y-2">
                  <p className="text-xs font-bold text-brand-text-bright font-sans">
                    Drag & drop your resume file (.pdf, .docx)
                  </p>
                  <p className="text-[10px] text-brand-text-muted font-medium">
                    Supports files up to 2MB. Safe transient encryption layers.
                  </p>
                </label>
              </div>

              {fileError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2.5 text-left animate-shake">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {isAnalyzing && (
                <div className="p-4 bg-brand-bg border border-brand-border rounded-xl space-y-3 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold font-mono">
                    <span className="text-indigo-400 animate-pulse">Running AI Scans...</span>
                    <span className="text-brand-text-muted">Analyzing layout layers</span>
                  </div>
                  <div className="h-1.5 w-full bg-brand-border/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-[progress_1.5s_infinite_linear]" style={{ width: "80%" }} />
                  </div>
                </div>
              )}

              {/* Action Trigger Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => document.getElementById("workspace-empty-file-picker")?.click()}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all duration-150 active:scale-95"
                >
                  <Upload size={14} />
                  <span>Upload Resume</span>
                </button>

                <button
                  onClick={scrollToQuickActions}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-colors duration-150 active:scale-95"
                >
                  <span>Explore Features</span>
                  <ChevronRight size={14} />
                </button>
              </div>

            </div>

          </div>

          {/* Quick Actions Toolkit Grid in Empty State */}
          <div id="quick-actions-section" className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
              <h3 className="font-bold text-sm text-brand-text-bright uppercase tracking-wider font-mono">
                Explore Toolkits
              </h3>
              <span className="text-[11px] text-brand-text-muted font-mono">
                Launch modules to kickstart your preparation
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, idx) => {
                const IconComp = action.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (action.onClick) {
                        action.onClick();
                      } else if (action.path) {
                        navigate(action.path);
                      }
                    }}
                    className="p-5 rounded-[18px] bg-brand-card border border-brand-border/60 hover:border-brand-border flex flex-col gap-4 transition-all duration-200 cursor-pointer relative overflow-hidden group hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg border border-brand-border/80 group-hover:border-indigo-500/20 group-hover:scale-105 transition-all duration-200 shrink-0">
                        <IconComp size={18} className="text-indigo-400" />
                      </div>
                      <span className="p-1 rounded bg-brand-bg border border-brand-border opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                        <ArrowUpRight size={12} className="text-indigo-400" />
                      </span>
                    </div>

                    <div className="space-y-1 leading-normal">
                      <h4 className="font-bold text-sm text-brand-text-bright group-hover:text-indigo-400 transition-colors duration-150">
                        {action.title}
                      </h4>
                      <p className="text-[11px] text-brand-text-secondary font-medium leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
