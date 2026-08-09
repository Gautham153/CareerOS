/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Layers,
  Briefcase,
  FileText,
  PenTool,
  History,
  TrendingUp,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  MessageSquare,
  LogOut,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Terminal,
  Menu,
  Calendar,
  Compass,
  ArrowRight,
  Home,
  Mic,
  Crown,
  Zap,
  MapPin,
  Lock
} from "lucide-react";
import { hasAccess, getRequiredPlanForPath, PlanLevel } from "../utils/featureAccess";
import { useAnalysis } from "../hooks/useAnalysis";
import { useFileParser } from "../hooks/useFileParser";
import { CareerOSLogo } from "./CareerOSLogo";
import SettingsPanel from "./SettingsPanel";
import { useApp } from "../context/AppContext";
import AuthScreen from "./AuthScreen";
import UpgradeModal from "./UpgradeModal";

interface UsageBadgeProps {
  plan?: string;
  currentUsage?: number;
  monthlyLimit?: number;
}

function UsageBadge({ plan = "FREE", currentUsage = 2, monthlyLimit = 5 }: UsageBadgeProps) {
  const normalizedPlan = (plan || "FREE").toUpperCase();

  if (normalizedPlan === "PRO") {
    return (
      <div 
        className="h-[36px] rounded-full px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.12)] transition-colors duration-[180ms] flex items-center gap-2 text-xs select-none"
      >
        <Zap size={14} className="text-[#8B7CFF] shrink-0" />
        <span className="text-[#8B7CFF] font-semibold">PRO</span>
        <span className="hidden sm:inline text-purple-400/40 font-normal">•</span>
        <span className="hidden sm:inline text-purple-300/90 font-medium">Unlimited AI</span>
      </div>
    );
  }

  if (normalizedPlan === "PREMIUM") {
    return (
      <div 
        className="h-[36px] rounded-full px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.12)] transition-colors duration-[180ms] flex items-center gap-2 text-xs select-none"
      >
        <Crown size={14} className="text-[#F6C453] shrink-0" />
        <span className="text-[#F6C453] font-semibold">PREMIUM</span>
        <span className="hidden sm:inline text-amber-500/40 font-normal">•</span>
        <span className="hidden sm:inline text-amber-200/90 font-medium">Unlimited Everything</span>
      </div>
    );
  }

  // Default: FREE PLAN
  return (
    <div 
      className="h-[36px] rounded-full px-4 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.12)] transition-colors duration-[180ms] flex items-center gap-2 text-xs select-none"
    >
      <Sparkles size={14} className="text-[#9A9AA5] shrink-0" />
      <span className="text-[#9A9AA5] font-semibold">FREE PLAN</span>
      <span className="hidden sm:inline text-slate-500 font-normal">•</span>
      <span className="hidden sm:inline text-white font-medium">{currentUsage} / {monthlyLimit} AI Analyses Left</span>
    </div>
  );
}

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentFile, isAnalyzing, analysisResult, history } = useAnalysis();
  const { isDragActive, fileError, handleDragOver, handleDragLeave, handleDrop, handleFileSelect, resetParserState } = useFileParser();

  const { 
    user, 
    loading, 
    plan, 
    theme, 
    setTheme, 
    sidebarCollapsed: isCollapsed, 
    setSidebarCollapsed: setIsCollapsed,
    systemNotifications,
    clearUnreadNotifications,
    logout,
    setUpgradeModalOpen
  } = useApp();

  const isDarkMode = theme === "dark";
  const setIsDarkMode = (dark: boolean) => setTheme(dark ? "dark" : "light");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modals state
  const [isNewAnalysisModalOpen, setIsNewAnalysisModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Notifications state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Resume analysis completed successfully", date: "Just now", unread: true },
    { id: 2, text: "Upgrade to PRO unlocked premium XYZ bullet optimization", date: "2 hours ago", unread: false },
    { id: 3, text: "ATS scoring model updated to version 1.1 Stable", date: "1 day ago", unread: false }
  ]);

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Simulated upload/analysis progress
  const [progressVal, setProgressVal] = useState(0);
  const [hasStartedModalAnalysis, setHasStartedModalAnalysis] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing && isNewAnalysisModalOpen) {
      setHasStartedModalAnalysis(true);
      setProgressVal(5);
      interval = setInterval(() => {
        setProgressVal((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 8) + 3;
        });
      }, 400);
    } else if (!isAnalyzing) {
      setProgressVal(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, isNewAnalysisModalOpen]);

  // Close modal and navigate when analysis complete
  useEffect(() => {
    if (hasStartedModalAnalysis && analysisResult && !isAnalyzing && isNewAnalysisModalOpen) {
      setProgressVal(100);
      const timer = setTimeout(() => {
        setIsNewAnalysisModalOpen(false);
        setHasStartedModalAnalysis(false);
        navigate("/dashboard");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasStartedModalAnalysis, analysisResult, isAnalyzing, isNewAnalysisModalOpen, navigate]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navLinks: Array<{
    path: string;
    label: string;
    icon: any;
    activeRequired?: boolean;
    requiredPlan?: PlanLevel;
    onClick?: () => void;
  }> = [
    { path: "/", label: "Home", icon: Home, requiredPlan: "FREE" },
    { path: "/workspace", label: "Workspace", icon: Briefcase, requiredPlan: "FREE" },
    { path: "/dashboard", label: "Dashboard", icon: Layers, activeRequired: true, requiredPlan: "FREE" },
    { path: "/pricing", label: "Pricing", icon: Crown, requiredPlan: "FREE" },
    { path: "/job-match", label: "Job Match", icon: Compass, requiredPlan: "PREMIUM" },
    { path: "/interview-coach", label: "Interview Coach", icon: Mic, requiredPlan: "PREMIUM" },
    { path: "/career-roadmap", label: "Career Roadmap", icon: MapPin, requiredPlan: "PREMIUM" },
    { path: "/rewriter", label: "AI Resume Rewriter", icon: Sparkles, requiredPlan: "PRO" },
    { path: "/analyzer", label: "Resume Analyzer", icon: FileText, requiredPlan: "FREE" },
    { path: "/improve", label: "Bullet Optimizer", icon: PenTool, requiredPlan: "PRO" },
    { path: "/history", label: "Saved Resumes", icon: History, requiredPlan: "PRO" },
    { path: "/reports", label: "Reports", icon: TrendingUp, requiredPlan: "FREE" },
    { path: "#", label: "Settings", icon: Settings, onClick: () => setIsSettingsOpen(true), requiredPlan: "FREE" }
  ];

  const searchPages = [
    { label: "Home Landing Page", path: "/", icon: Home },
    { label: "Candidate Workspace", path: "/workspace", icon: Briefcase },
    { label: "ATS Score Dashboard", path: "/dashboard", icon: Layers },
    { label: "Premium Pricing Plans", path: "/pricing", icon: Crown },
    { label: "AI Job Description Matcher", path: "/job-match", icon: Compass },
    { label: "AI Interview Coach Prep", path: "/interview-coach", icon: Mic },
    { label: "AI Career Roadmap & Skill Gap", path: "/career-roadmap", icon: MapPin },
    { label: "AI Resume Rewriter", path: "/rewriter", icon: Sparkles },
    { label: "Resume Analyzer Upload", path: "/analyzer", icon: FileText },
    { label: "Google X-Y-Z Bullet Optimizer", path: "/improve", icon: PenTool },
    { label: "Saved Resumes & Scan History", path: "/history", icon: History },
    { label: "ATS Analytical Reports", path: "/reports", icon: TrendingUp }
  ];

  const filteredPages = searchQuery
    ? searchPages.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchSelect = (path: string) => {
    setSearchQuery("");
    setShowSearchResults(false);
    const reqPlan = getRequiredPlanForPath(path);
    if (!hasAccess(plan, reqPlan)) {
      setUpgradeModalOpen(true);
      return;
    }
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Home";
      case "/workspace":
        return "Workspace";
      case "/dashboard":
        return "Score Dashboard";
      case "/pricing":
        return "Pricing";
      case "/job-match":
        return "AI Job Match";
      case "/interview-coach":
        return "Interview Coach";
      case "/rewriter":
        return "AI Resume Rewriter";
      case "/analyzer":
        return "Resume Analyzer";
      case "/improve":
        return "Bullet Optimizer";
      case "/history":
        return "Saved Resumes";
      case "/reports":
        return "Analytical Reports";
      default:
        return "AI Workspace";
    }
  };

  const getDynamicDate = () => {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const monthDay = today.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const year = today.getFullYear();
    return `Today • ${dayName}, ${monthDay}, ${year}`;
  };

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return "";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const sendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setFeedbackText("");
    setTimeout(() => {
      setFeedbackSent(false);
      setIsFeedbackOpen(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070F] text-slate-200 flex flex-col items-center justify-center font-sans">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black text-white shadow-2xl relative group mb-4">
          <div className="absolute inset-0 rounded-2xl bg-[#7C5CFF]/20 blur animate-pulse" />
          <CareerOSLogo className="w-7 h-7 text-[#7C5CFF] relative z-10" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 font-semibold text-xs tracking-wider uppercase">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#7C5CFF] border-t-transparent" />
          <span>Synchronizing Workspace...</span>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== "/") {
    return <AuthScreen />;
  }

  return (
    <div className={`min-h-screen bg-brand-bg text-brand-text-primary flex font-sans antialiased overflow-x-hidden ${isDarkMode ? "dark" : ""}`}>
      
      {/* Dynamic ambient grid overlay - subtle and theme-aware */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,92,255,0.03),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.02),transparent_50%)] pointer-events-none z-0" />

      {/* ==========================================
         ================ LEFT SIDEBAR =============
         ========================================== */}
      
      {/* Desktop Permanent Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen fixed top-0 left-0 z-30 border-r border-brand-border bg-brand-sidebar transition-all duration-300 ease-in-out select-none shadow-[1px_0_10px_rgba(0,0,0,0.03)] ${
          isCollapsed ? "w-20" : "w-[270px]"
        }`}
      >
        {/* Sidebar Header Block */}
        <div className="p-5 flex items-center justify-between border-b border-brand-border">
          <Link to="/" className="flex items-center gap-3 group overflow-hidden shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-white shadow-sm group-hover:scale-105 transition-all">
              <CareerOSLogo className="w-5 h-5 text-[#7C5CFF]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none animate-fadeIn">
                <span className="font-extrabold text-sm tracking-tight text-brand-text-bright font-display">
                  CareerOS
                </span>
                <span className="text-[10px] text-brand-text-muted mt-1 font-medium">
                  AI Career Workspace
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Action Button Segment */}
        <div className="p-4 shrink-0">
          <button
            onClick={() => setIsNewAnalysisModalOpen(true)}
            className={`w-full group flex items-center justify-center gap-2 bg-[#7C5CFF] hover:bg-[#6A4BE0] text-white font-bold transition-all shadow-sm rounded-xl cursor-pointer ${
              isCollapsed ? "py-3 px-1" : "py-3 px-4 text-xs tracking-wider uppercase"
            }`}
            title="Start New Analysis"
          >
            <Upload size={16} className="group-hover:translate-y-[-1px] transition-transform" />
            {!isCollapsed && <span className="animate-fadeIn">+ New Analysis</span>}
          </button>
        </div>

        {/* Sidebar Page Search */}
        {!isCollapsed && (
          <div className="px-4 py-2 relative shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search pages..."
                className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-xl text-xs text-brand-text-primary placeholder-brand-text-muted focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-brand-text-muted hover:text-brand-text-primary"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Quick Search Dropdown list */}
            {showSearchResults && searchQuery && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSearchResults(false)} />
                <div className="absolute left-4 right-4 mt-1 bg-brand-card border border-brand-border rounded-xl shadow-2xl p-2 z-20 max-h-[220px] overflow-y-auto">
                  {filteredPages.length > 0 ? (
                    filteredPages.map((page) => {
                      const IconComp = page.icon;
                      return (
                        <button
                          key={page.path}
                          onClick={() => handleSearchSelect(page.path)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover transition-colors"
                        >
                          <IconComp size={13} className="text-[#7C5CFF]" />
                          <span>{page.label}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-[11px] text-slate-500 font-medium py-3 text-center">No pages matched</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

         {/* Sidebar Links navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">
          {navLinks.map((link) => {
            const isCurrent = link.path !== "#" && isActive(link.path);
            const LinkIcon = link.icon;
            
            // Allow dashboard only if analyzed, or redirect beautifully with inline feedback
            const isLinkDisabled = link.activeRequired && !analysisResult;

            // Check plan lock
            const reqPlan = link.requiredPlan || "FREE";
            const isLocked = !hasAccess(plan, reqPlan);

            if (link.onClick) {
              return (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide relative group transition-all duration-200 overflow-hidden text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover cursor-pointer ${
                    isCollapsed ? "justify-center" : "text-left"
                  }`}
                  title={link.label}
                >
                  <LinkIcon size={16} className="transition-transform duration-200 group-hover:scale-105 shrink-0 text-brand-text-muted group-hover:text-brand-text-primary" />
                  {!isCollapsed && <span className="animate-fadeIn">{link.label}</span>}
                </button>
              );
            }

            if (isLocked) {
              return (
                <button
                  key={link.path}
                  onClick={() => setUpgradeModalOpen(true)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide relative group transition-all duration-200 overflow-hidden text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover border border-transparent cursor-pointer ${
                    isCollapsed ? "justify-center" : "text-left"
                  }`}
                  title={`${link.label} (${reqPlan} feature)`}
                >
                  <LinkIcon size={16} className="transition-transform duration-200 group-hover:scale-105 shrink-0 text-brand-text-muted group-hover:text-brand-text-primary opacity-80" />
                  {!isCollapsed && (
                    <>
                      <span className="animate-fadeIn truncate">{link.label}</span>
                      <Lock size={13} className="opacity-70 text-slate-400 shrink-0 ml-auto" />
                    </>
                  )}
                  {isCollapsed && (
                    <span className="absolute top-1 right-1">
                      <Lock size={10} className="opacity-70 text-slate-400" />
                    </span>
                  )}
                </button>
              );
            }
            
            return (
              <Link
                key={link.path}
                to={isLinkDisabled ? "/analyzer" : link.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold tracking-wide relative group transition-all duration-200 overflow-hidden ${
                  isCurrent
                    ? "text-brand-text-bright bg-[#7C5CFF]/10 border border-[#7C5CFF]/20"
                    : "text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover border border-transparent"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={link.label}
              >
                <LinkIcon size={16} className={`transition-transform duration-200 group-hover:scale-105 shrink-0 ${isCurrent ? "text-[#7C5CFF]" : "text-brand-text-muted group-hover:text-brand-text-primary"}`} />
                {!isCollapsed && <span className="animate-fadeIn">{link.label}</span>}

                {/* Left Active border indicator strip */}
                {isCurrent && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r-md bg-[#7C5CFF]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Little dot if dashboard has active file */}
                {link.activeRequired && analysisResult && !isCollapsed && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Profile & Core pinned bottom controls */}
        <div className="p-4 border-t border-brand-border space-y-4 shrink-0 bg-brand-sidebar">
          
          {/* Collapsed view simple avatar or expanded premium panel */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-bg border border-brand-border font-extrabold text-xs text-brand-text-bright group-hover:border-[#7C5CFF] transition-all">
                  {user?.displayName?.[0]?.toUpperCase() || "C"}
                </div>
                <span className={`absolute -bottom-1 -right-1 flex h-4 px-1 items-center justify-center rounded-full border border-brand-bg text-[7px] font-black text-white scale-75 leading-none ${
                  plan === "PREMIUM"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950"
                    : plan === "PRO"
                    ? "bg-gradient-to-r from-[#7C5CFF] to-indigo-600 text-white"
                    : "bg-slate-700 text-slate-200"
                }`}>
                  {plan}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Profile Card details */}
              <div className="flex items-center justify-between gap-2 p-2 bg-brand-bg rounded-xl border border-brand-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card border border-brand-border font-extrabold text-xs text-brand-text-bright">
                      {user?.displayName?.[0]?.toUpperCase() || "C"}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 flex h-4 px-1.5 items-center justify-center rounded-full border border-brand-bg text-[7.5px] font-black leading-none ${
                      plan === "PREMIUM"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950"
                        : plan === "PRO"
                        ? "bg-gradient-to-r from-[#7C5CFF] to-indigo-600 text-white"
                        : "bg-slate-700 text-slate-200"
                    }`}
                    onClick={() => plan === "FREE" && setUpgradeModalOpen(true)}
                    title={plan === "FREE" ? "Click to Upgrade" : `${plan} Active`}
                    >
                      {plan}
                    </span>
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="text-xs font-bold text-brand-text-primary truncate">{user?.displayName || "Candidate"}</p>
                    <p className="text-[10px] text-brand-text-muted truncate mt-0.5">{user?.email || "sandbox@careeros.ai"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-1 text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover rounded-lg transition-colors cursor-pointer"
                    title="User Settings"
                  >
                    <Settings size={13} />
                  </button>
                  <span className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-1 text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover rounded-lg transition-colors cursor-pointer"
                    >
                      <Bell size={13} />
                    </button>
                    {systemNotifications.some(n => n.unread) && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    )}
                  </span>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/", { replace: true });
                    }}
                    className="p-1 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={13} />
                  </button>
                </div>
              </div>

              {/* Theme toggle & Feedback & Support links */}
              <div className="grid grid-cols-3 gap-2 border-t border-brand-border pt-3.5">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary hover:text-brand-text-primary transition-all cursor-pointer"
                  title="Toggle Visual Theme"
                >
                  {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
                  <span className="text-[9px] mt-1 font-medium">Theme</span>
                </button>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary hover:text-brand-text-primary transition-all cursor-pointer"
                  title="Submit Feedback"
                >
                  <MessageSquare size={14} />
                  <span className="text-[9px] mt-1 font-medium">Feedback</span>
                </button>

                <button
                  onClick={() => setIsHelpOpen(true)}
                  className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary hover:text-brand-text-primary transition-all cursor-pointer"
                  title="Platform Help"
                >
                  <HelpCircle size={14} />
                  <span className="text-[9px] mt-1 font-medium">Support</span>
                </button>
              </div>

            </div>
          )}

          {/* Sidebar Collapse Toggle trigger */}
          <button
            onClick={toggleSidebar}
            className="w-full py-1.5 flex items-center justify-center text-brand-text-muted hover:text-brand-text-primary bg-brand-bg border border-brand-border hover:border-brand-border/80 rounded-xl transition-all cursor-pointer"
            title={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase"><ChevronLeft size={14} /> Collapse</div>}
          </button>
        </div>
      </aside>

      {/* ==========================================
         ============= MOBILE DRAWER SIDEBAR ========
         ========================================== */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[270px] z-50 bg-brand-sidebar border-r border-brand-border flex flex-col p-5 md:hidden"
            >
              <div className="flex items-center justify-between border-b border-brand-border pb-4 mb-4">
                <Link to="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-white shadow-sm">
                    <CareerOSLogo className="w-5 h-5 text-[#7C5CFF]" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-brand-text-bright font-display">
                    CareerOS
                  </span>
                </Link>
                <button onClick={() => setIsMobileOpen(false)} className="p-1 text-brand-text-muted hover:text-brand-text-primary">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4">
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    setIsNewAnalysisModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#7C5CFF] hover:bg-[#6A4BE0] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  <Upload size={14} />
                  + New Analysis
                </button>
              </div>

              {/* Navlinks */}
              <div className="flex-1 space-y-1.5 overflow-y-auto">
                {navLinks.map((link) => {
                  const isCurrent = isActive(link.path);
                  const LinkIcon = link.icon;
                  const isLinkDisabled = link.activeRequired && !analysisResult;
                  const reqPlan = link.requiredPlan || "FREE";
                  const isLocked = !hasAccess(plan, reqPlan);

                  if (isLocked) {
                    return (
                      <button
                        key={link.path}
                        onClick={() => {
                          setIsMobileOpen(false);
                          setUpgradeModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <LinkIcon size={16} />
                          <span>{link.label}</span>
                        </div>
                        <Lock size={12} className="opacity-70 text-slate-400 shrink-0" />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={link.path}
                      to={isLinkDisabled ? "/analyzer" : link.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                        isCurrent
                          ? "bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20"
                          : "text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover"
                      }`}
                    >
                      <LinkIcon size={16} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

               {/* Profile card bottom */}
              <div className="border-t border-brand-border pt-4 mt-4 space-y-4">
                <div className="flex items-center gap-2.5 p-2 bg-brand-bg border border-brand-border rounded-xl">
                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card border border-brand-border font-extrabold text-xs text-brand-text-bright">
                      {user?.displayName?.[0]?.toUpperCase() || "C"}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 flex h-4 px-1.5 items-center justify-center rounded-full border border-brand-bg text-[7.5px] font-black leading-none ${
                      plan === "PREMIUM"
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950"
                        : plan === "PRO"
                        ? "bg-gradient-to-r from-[#7C5CFF] to-indigo-600 text-white"
                        : "bg-slate-700 text-slate-200"
                    }`}>
                      {plan}
                    </span>
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="text-xs font-bold text-brand-text-primary">{user?.displayName || "Candidate"}</p>
                    <p className="text-[10px] text-brand-text-muted truncate mt-0.5">{user?.email || "sandbox@careeros.ai"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      setIsDarkMode(!isDarkMode);
                    }}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary hover:text-brand-text-primary"
                  >
                    {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
                    <span className="text-[9px] mt-1">Theme</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      setIsFeedbackOpen(true);
                    }}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary hover:text-brand-text-primary"
                  >
                    <MessageSquare size={14} />
                    <span className="text-[9px] mt-1">Feedback</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      setIsHelpOpen(true);
                    }}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-brand-text-secondary hover:text-brand-text-primary"
                  >
                    <HelpCircle size={14} />
                    <span className="text-[9px] mt-1">Support</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ==========================================
         =============== MAIN CONTENT ===============
         ========================================== */}
      <div
        className={`flex-1 flex flex-col min-h-screen z-10 transition-all duration-300 ${
          isCollapsed ? "md:pl-20" : "md:pl-[270px]"
        }`}
      >
        
        {/* Slim Workspace Header */}
        <header className="sticky top-0 z-20 w-full border-b border-brand-border bg-brand-bg/85 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile drawer */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-card-hover rounded-xl border border-brand-border md:hidden transition-colors cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Title / Breadcrumbs */}
            <div className="py-1">
              <h2 className="text-lg font-bold text-brand-text-bright tracking-tight">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Quick Active file info & controls */}
          <div className="flex items-center gap-4">
            
            {currentFile && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-card border border-brand-border shadow-sm text-xs font-mono text-emerald-500">
                <FileText size={13} className="text-emerald-500 shrink-0" />
                <span className="truncate max-w-[120px] font-bold">{currentFile.name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
            )}

            {/* SaaS Style Premium/Upgrade Button */}
            <div className="flex items-center">
              {plan === "PRO" ? (
                <motion.button
                  whileHover={{ translateY: -1, backgroundColor: "rgba(110,89,255,0.24)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsMobileOpen?.(false);
                    navigate("/pricing");
                  }}
                  className="h-[38px] rounded-full px-[18px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none border border-[rgba(110,89,255,0.35)] text-[#8B7CFF] bg-[rgba(110,89,255,0.18)]"
                >
                  <span>🟣 PRO</span>
                </motion.button>
              ) : plan === "PREMIUM" ? (
                <motion.button
                  whileHover={{ 
                    translateY: -1, 
                    boxShadow: "0 8px 24px rgba(246, 196, 83, 0.25)" 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsMobileOpen?.(false);
                    navigate("/pricing");
                  }}
                  className="h-[38px] rounded-full px-[18px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none border border-transparent text-slate-950"
                  style={{
                    background: "linear-gradient(135deg, #F6C453, #F2A93B)",
                    boxShadow: "0 6px 20px rgba(246, 196, 83, 0.15)",
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>PREMIUM</span>
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ 
                    translateY: -1, 
                    background: "linear-gradient(135deg, #7E6BFF, #AD57FF)",
                    boxShadow: "0 10px 28px rgba(110, 89, 255, 0.38)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsMobileOpen?.(false);
                    navigate("/pricing");
                  }}
                  className="h-[38px] rounded-full px-[18px] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none border border-transparent text-white"
                  style={{
                    background: "linear-gradient(135deg, #6E59FF, #9D46FF)",
                    boxShadow: "0 8px 24px rgba(110, 89, 255, 0.28)",
                  }}
                >
                  <Crown size={14} className="shrink-0" />
                  <span>Upgrade</span>
                </motion.button>
              )}
            </div>

            {/* Usage Badge */}
            <UsageBadge plan={plan} currentUsage={2} monthlyLimit={5} />

            {/* Current Calendar Date */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-text-secondary bg-brand-card px-3 h-[38px] border border-brand-border rounded-full">
              <Calendar size={13} className="text-[#7C5CFF]" />
              <span className="font-semibold">{getDynamicDate()}</span>
            </div>

            {/* Secondary Header Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 text-brand-text-secondary hover:text-brand-text-primary bg-brand-card border border-brand-border rounded-xl transition-colors cursor-pointer"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 text-brand-text-secondary hover:text-brand-text-primary bg-brand-card border border-brand-border rounded-xl transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={15} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                  )}
                </button>

                {/* Notifications Panel overlay */}
                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2.5 w-80 bg-brand-card border border-brand-border rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
                          <span className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">Inbox</span>
                          <button
                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                            className="text-[10px] text-[#7C5CFF] hover:text-[#6A4BE0] font-bold"
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="space-y-2.5">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-2.5 bg-brand-bg border border-brand-border rounded-xl flex items-start gap-2.5 relative">
                              {n.unread && <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-[#7C5CFF] rounded-full shrink-0" />}
                              <div className="flex-1 space-y-1">
                                <p className="text-xs text-brand-text-primary font-medium leading-normal pr-3">{n.text}</p>
                                <span className="text-[9px] font-mono text-brand-text-muted block">{n.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </header>

        {/* Core dynamic route page wrapper with smooth transition animations */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.995 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1.0] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* ==========================================
         ================= MODALS ==================
         ========================================== */}
      
      {/* 1. Unified "+ New Analysis" Modal */}
      <AnimatePresence>
        {isNewAnalysisModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isAnalyzing) {
                  setIsNewAnalysisModalOpen(false);
                  resetParserState();
                }
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Card Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#090D1A] border border-white/10 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" />
                  <h3 className="text-lg font-bold text-slate-100">AI ATS Audit Engine</h3>
                </div>
                {!isAnalyzing && (
                  <button
                    onClick={() => {
                      setIsNewAnalysisModalOpen(false);
                      resetParserState();
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {!isAnalyzing ? (
                // Modal Dropzone
                <div className="space-y-6">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                      isDragActive
                        ? "border-indigo-400 bg-indigo-500/5"
                        : "border-white/10 bg-slate-950/20 hover:border-white/20 hover:bg-slate-950/30"
                    }`}
                  >
                    <input
                      type="file"
                      id="modal-resume-file"
                      className="hidden"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="modal-resume-file" className="cursor-pointer flex flex-col items-center">
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/15 flex items-center justify-center mb-4">
                        <Upload size={22} className="animate-bounce" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-200">Upload your resume</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed mx-auto">
                        Drag & drop your file or click to browse. Supports PDF or DOCX up to 2MB.
                      </p>
                    </label>
                  </div>

                  {fileError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2.5">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>
              ) : (
                // Analysis progress
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">Uploading Resume</h4>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">Model: gemini-3.5-flash</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-400">{progressVal}%</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Scanning text layers</span>
                      <span className="animate-pulse">Analyzing...</span>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl font-mono text-[10px] text-slate-400 leading-relaxed max-h-[120px] overflow-y-auto">
                    <div className="flex items-center gap-2 text-indigo-300 mb-1">
                      <Terminal size={12} className="shrink-0" />
                      <span>Live Audit Logs</span>
                    </div>
                    {progressVal >= 10 && <p className="text-emerald-400">✔ Loaded file successfully</p>}
                    {progressVal >= 30 && <p className="text-emerald-400">✔ Parsing raw text layers</p>}
                    {progressVal >= 60 && <p className="text-indigo-400">⌛ Evaluating accomplishment action-verbs (XYZ framework)</p>}
                    {progressVal >= 80 && <p className="text-indigo-400">⌛ Auditing brevity, formatting layers, and skill densities</p>}
                    {progressVal >= 95 && <p className="text-purple-400">⌛ Generating premium recommendations</p>}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Settings Panel Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        )}
      </AnimatePresence>

      {/* 3. Help Panel Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#090D1A] border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-indigo-400" />
                  <h3 className="text-lg font-bold text-slate-100">Platform Support</h3>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-xl">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                <div className="p-3 bg-slate-950/30 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-indigo-400">What check-scores are executed?</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    CareerOS scans 5 fundamental pillars: Action Verbs density, Brevity indices (eliminating pronouns & passive logs), Formatting layers, Section coverage, and hard/soft Skills gaps compared directly with commercial hiring matrices.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/30 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-indigo-400">How do I leverage the Google X-Y-Z formula?</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Open the Bullet Optimizer. Paste any simple task list and type context indicators. Gemini automatically generates outcomes framed as: "Accomplished [X], as measured by [Y], by doing [Z]" to boost conversion.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/30 rounded-xl border border-white/5 space-y-1">
                  <h4 className="font-bold text-indigo-400">Are my resume PDF details stored offline?</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Yes, fully. PDF extraction runs in your sandboxed local client context. Summarized scores are saved inside your device's browser `localStorage` engine and never stored on third-party cloud databases.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6 flex justify-end">
                <button
                  onClick={() => setIsHelpOpen(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Feedback Pinned Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#090D1A] border border-white/10 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-400" />
                  <h3 className="text-lg font-bold text-slate-100">Send Feedback</h3>
                </div>
                <button onClick={() => setIsFeedbackOpen(false)} className="p-1.5 text-slate-400 hover:text-white rounded-xl">
                  <X size={16} />
                </button>
              </div>

              {feedbackSent ? (
                <div className="py-8 text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-100 text-sm">Feedback Sent!</h4>
                    <p className="text-xs text-slate-400">Thank you for helping us refine the workspace.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={sendFeedback} className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Encountered an issue or have suggestions for the layout? Let our team know. We review all notes daily.
                  </p>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                    rows={4}
                    placeholder="Type your notes or feature requests here..."
                    className="w-full p-3.5 bg-slate-950/40 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFeedbackOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg transition-colors cursor-pointer"
                    >
                      Submit Notes
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Premium Subscription Upgrade Modal */}
      <AnimatePresence>
        <UpgradeModal />
      </AnimatePresence>

    </div>
  );
}
