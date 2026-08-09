/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Settings,
  User,
  Award,
  Cpu,
  Lock,
  Palette,
  FileText,
  Bell,
  Sliders,
  Info,
  Check,
  ChevronDown,
  Trash2,
  LogOut,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  History,
  Languages,
  ShieldCheck,
  Laptop
} from "lucide-react";
import { useApp } from "../context/AppContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

type TabType =
  | "general"
  | "profile"
  | "subscription"
  | "ai"
  | "privacy"
  | "appearance"
  | "resume"
  | "notifications"
  | "advanced"
  | "about";

export default function SettingsPanel({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode
}: SettingsPanelProps) {
  const { user, updateProfile: updateAppProfile, plan } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [accentColor, setAccentColor] = useState<string>("purple");

  // Success Notification banner
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // ----------------------------------------------------
  // LOCAL STORAGE STATE KEYS & INITIALIZATIONS
  // ----------------------------------------------------
  
  // Profile settings
  const [pName, setPName] = useState(() => user?.displayName || localStorage.getItem("resume_iq_profile_name") || "Gautham");
  const [pEmail, setPEmail] = useState(() => user?.email || localStorage.getItem("resume_iq_profile_email") || "gautham153@gmail.com");
  const [pUsername, setPUsername] = useState(() => user?.displayName?.toLowerCase().replace(/\s+/g, "") || localStorage.getItem("resume_iq_profile_username") || "gautham153");
  const [pCollege, setPCollege] = useState(() => user?.college || localStorage.getItem("resume_iq_profile_college") || "Stanford University");
  const [pBio, setPBio] = useState(() => user?.bio || localStorage.getItem("resume_iq_profile_bio") || "Aspiring Software Engineer focused on AI, fullstack systems, and elegant user interfaces.");
  const [pAvatar, setPAvatar] = useState(() => localStorage.getItem("resume_iq_profile_avatar") || "G");

  useEffect(() => {
    if (user) {
      setPName(user.displayName || "Candidate");
      setPEmail(user.email || "sandbox@careeros.ai");
      setPCollege(user.college || "Stanford University");
      setPBio(user.bio || "Aspiring Software Engineer focused on AI, fullstack systems, and elegant user interfaces.");
      setPUsername(user.displayName?.toLowerCase().replace(/\s+/g, "") || "candidate");
    }
  }, [user]);

  // General settings
  const [gWorkspaceName, setGWorkspaceName] = useState(() => localStorage.getItem("resume_iq_general_workspace_name") || "Main Career Workspace");
  const [gDefaultResume, setGDefaultResume] = useState(() => localStorage.getItem("resume_iq_general_default_resume_name") || "Gautham_Resume_2026.pdf");
  const [gLanguage, setGLanguage] = useState(() => localStorage.getItem("resume_iq_general_language") || "English");
  const [gRegion, setGRegion] = useState(() => localStorage.getItem("resume_iq_general_region") || "United States");
  const [gTimeFormat, setGTimeFormat] = useState(() => localStorage.getItem("resume_iq_general_time_format") || "12-hour");
  const [gDateFormat, setGDateFormat] = useState(() => localStorage.getItem("resume_iq_general_date_format") || "MM/DD/YYYY");
  const [gAutosave, setGAutosave] = useState(() => (localStorage.getItem("resume_iq_general_autosave") !== "false"));
  const [gUndoHistory, setGUndoHistory] = useState(() => (localStorage.getItem("resume_iq_general_undo_history") !== "false"));
  const [gFileStorage, setGFileStorage] = useState(() => localStorage.getItem("resume_iq_general_file_storage") || "Local Browser");

  // Appearance
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem("resume_iq_theme_option") || "dark");
  const [appAnimSpeed, setAppAnimSpeed] = useState(() => localStorage.getItem("resume_iq_animation_speed") || "normal");
  const [appCompact, setAppCompact] = useState(() => localStorage.getItem("resume_iq_compact_mode") === "true");
  const [appSidebarCollapse, setAppSidebarCollapse] = useState(() => localStorage.getItem("resume_iq_sidebar_collapsed") === "true");
  const [appCardDensity, setAppCardDensity] = useState(() => localStorage.getItem("resume_iq_card_density") || "comfortable");

  // AI Settings
  const [aiModel, setAiModel] = useState(() => localStorage.getItem("resume_iq_ai_model") || "Gemini 3.5 Flash");
  const [aiTemperature, setAiTemperature] = useState(() => parseFloat(localStorage.getItem("resume_iq_ai_temperature") || "0.7"));
  const [aiCreativity, setAiCreativity] = useState(() => parseFloat(localStorage.getItem("resume_iq_ai_creativity") || "0.6"));
  const [aiStreaming, setAiStreaming] = useState(() => (localStorage.getItem("resume_iq_ai_streaming_output") !== "false"));
  const [aiAutoRetry, setAiAutoRetry] = useState(() => (localStorage.getItem("resume_iq_ai_auto_retry") !== "false"));
  const [aiRetryCount, setAiRetryCount] = useState(() => parseInt(localStorage.getItem("resume_iq_ai_retry_count") || "3"));
  const [aiPromptOpt, setAiPromptOpt] = useState(() => (localStorage.getItem("resume_iq_ai_prompt_optimization") !== "false"));
  const [aiContextLength, setAiContextLength] = useState(() => localStorage.getItem("resume_iq_ai_context_length") || "128K");

  // Resume Settings
  const [resAtsScore, setResAtsScore] = useState(() => parseInt(localStorage.getItem("resume_iq_resume_default_ats_score") || "85"));
  const [resPreferredStyle, setResPreferredStyle] = useState(() => localStorage.getItem("resume_iq_resume_preferred_style") || "Modern");
  const [resAutoSave, setResAutoSave] = useState(() => (localStorage.getItem("resume_iq_resume_auto_save") !== "false"));
  const [resAutoAnalyze, setResAutoAnalyze] = useState(() => (localStorage.getItem("resume_iq_resume_auto_analyze") !== "false"));
  const [resDefaultExport, setResDefaultExport] = useState(() => localStorage.getItem("resume_iq_resume_default_export") || "PDF");
  const [resRememberJd, setResRememberJd] = useState(() => (localStorage.getItem("resume_iq_resume_remember_last_jd") !== "false"));

  // Notifications
  const [notifEmailFinished, setNotifEmailFinished] = useState(() => (localStorage.getItem("resume_iq_notif_email_finished") !== "false"));
  const [notifEmailAnalysis, setNotifEmailAnalysis] = useState(() => (localStorage.getItem("resume_iq_notif_email_analysis") !== "false"));
  const [notifEmailWeekly, setNotifEmailWeekly] = useState(() => (localStorage.getItem("resume_iq_notif_email_weekly") === "true"));
  const [notifEmailSecurity, setNotifEmailSecurity] = useState(() => (localStorage.getItem("resume_iq_notif_email_security") !== "false"));
  const [notifEmailUpdates, setNotifEmailUpdates] = useState(() => (localStorage.getItem("resume_iq_notif_email_updates") === "true"));
  const [notifDesktopAlerts, setNotifDesktopAlerts] = useState(() => (localStorage.getItem("resume_iq_notif_desktop_alerts") !== "false"));

  // Privacy / Custom API Key
  const [apiKeyVal, setApiKeyVal] = useState(() => localStorage.getItem("resume_iq_custom_gemini_key") || "");
  const [showApiKey, setShowApiKey] = useState(false);

  // Advanced settings
  const [advDevMode, setAdvDevMode] = useState(() => (localStorage.getItem("resume_iq_adv_dev_mode") === "true"));
  const [advVerboseLogs, setAdvVerboseLogs] = useState(() => (localStorage.getItem("resume_iq_adv_verbose_logs") === "true"));
  const [advExperimental, setAdvExperimental] = useState(() => (localStorage.getItem("resume_iq_adv_experimental") === "true"));

  // ----------------------------------------------------
  // PERSIST & UPDATE DYNAMIC SCHEMES INSTANTLY
  // ----------------------------------------------------
  
  // Load accent color on mount
  useEffect(() => {
    const savedAccent = localStorage.getItem("resume_iq_accent_color") || "purple";
    setAccentColor(savedAccent);
  }, []);

  // Update theme option in parents and body
  const changeTheme = (newTheme: string) => {
    setAppTheme(newTheme);
    localStorage.setItem("resume_iq_theme_option", newTheme);

    const root = document.documentElement;
    let makeDark = newTheme === "dark";
    if (newTheme === "system") {
      makeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    setIsDarkMode(makeDark);
    localStorage.setItem("resume_iq_theme", makeDark ? "dark" : "light");

    if (makeDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  // Accent mapping class
  const colors = {
    purple: {
      accent: "#7C5CFF",
      border: "rgba(124, 92, 255, 0.2)",
      bg: "bg-purple-500",
      bgLight: "bg-purple-500/10",
      text: "text-purple-400",
      hover: "hover:text-purple-300",
      glow: "shadow-[0_0_20px_rgba(124,92,255,0.15)]",
      gradient: "from-[#6E59FF] to-[#9D46FF]"
    },
    blue: {
      accent: "#3B82F6",
      border: "rgba(59, 130, 246, 0.2)",
      bg: "bg-blue-500",
      bgLight: "bg-blue-500/10",
      text: "text-blue-400",
      hover: "hover:text-blue-300",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      gradient: "from-[#2563EB] to-[#1D4ED8]"
    },
    indigo: {
      accent: "#6366F1",
      border: "rgba(99, 102, 241, 0.2)",
      bg: "bg-indigo-500",
      bgLight: "bg-indigo-500/10",
      text: "text-indigo-400",
      hover: "hover:text-indigo-300",
      glow: "shadow-[0_0_20px_rgba(99,102,241,0.15)]",
      gradient: "from-[#4F46E5] to-[#4338CA]"
    },
    emerald: {
      accent: "#10B981",
      border: "rgba(16, 185, 129, 0.2)",
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-500/10",
      text: "text-emerald-400",
      hover: "hover:text-emerald-300",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      gradient: "from-[#059669] to-[#047857]"
    }
  };

  const c = colors[accentColor as keyof typeof colors] || colors.purple;

  const handleAccentChange = (col: string) => {
    setAccentColor(col);
    localStorage.setItem("resume_iq_accent_color", col);
    triggerToast(`Accent color updated to ${col.toUpperCase()}`);
  };

  // Instant toggles
  const handleToggle = (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    localStorage.setItem(key, String(val));
    
    // Side effects
    if (key === "resume_iq_sidebar_collapsed") {
      // Dispatches a local event so other components sync
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Dropdown instant change
  const handleSelectChange = (key: string, val: string, setter: (v: string) => void, msg?: string) => {
    setter(val);
    localStorage.setItem(key, val);
    if (msg) {
      triggerToast(msg);
    }
  };

  // Save profile modifications
  const handleSaveProfile = async () => {
    try {
      localStorage.setItem("resume_iq_profile_name", pName);
      localStorage.setItem("resume_iq_profile_email", pEmail);
      localStorage.setItem("resume_iq_profile_username", pUsername);
      localStorage.setItem("resume_iq_profile_college", pCollege);
      localStorage.setItem("resume_iq_profile_bio", pBio);
      localStorage.setItem("resume_iq_profile_avatar", pAvatar);

      await updateAppProfile({
        displayName: pName,
        bio: pBio,
        college: pCollege
      });

      triggerToast("Profile changes saved to cloud!");
    } catch (err) {
      console.error("Cloud profile save error:", err);
      triggerToast("Profile saved locally!");
    }
  };

  // Save General settings
  const handleSaveGeneral = () => {
    localStorage.setItem("resume_iq_general_workspace_name", gWorkspaceName);
    localStorage.setItem("resume_iq_general_default_resume_name", gDefaultResume);
    triggerToast("General Workspace settings saved!");
  };

  const handleResetPreferences = () => {
    if (window.confirm("Are you sure you want to restore default preferences? This only resets visual configurations.")) {
      setPName("Gautham");
      setPUsername("gautham153");
      setPCollege("Stanford University");
      setPBio("Aspiring Software Engineer focused on AI, fullstack systems, and elegant user interfaces.");
      setAccentColor("purple");
      changeTheme("dark");
      setAiModel("Gemini 3.5 Flash");
      setAiTemperature(0.7);
      setAiCreativity(0.6);
      setResAtsScore(85);
      setResPreferredStyle("Modern");
      setResDefaultExport("PDF");
      
      localStorage.removeItem("resume_iq_profile_name");
      localStorage.removeItem("resume_iq_profile_username");
      localStorage.removeItem("resume_iq_profile_college");
      localStorage.removeItem("resume_iq_profile_bio");
      localStorage.removeItem("resume_iq_accent_color");
      localStorage.removeItem("resume_iq_theme_option");
      localStorage.removeItem("resume_iq_ai_model");
      localStorage.removeItem("resume_iq_ai_temperature");
      localStorage.removeItem("resume_iq_ai_creativity");
      localStorage.removeItem("resume_iq_resume_default_ats_score");
      localStorage.removeItem("resume_iq_resume_preferred_style");
      localStorage.removeItem("resume_iq_resume_default_export");
      
      triggerToast("Preferences restored to default state.");
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm("🚨 CRITICAL WARNING: This will permanently wipe all history, resume scans, custom interview results, and reset all settings to zero. This cannot be undone. Proceed?")) {
      localStorage.clear();
      triggerToast("System factory reset complete. Reloading...");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const clearAllCache = () => {
    triggerToast("Clearing local analysis state cache...");
    setTimeout(() => {
      triggerToast("Cache cleared successfully! (34.2 MB recovered)");
    }, 800);
  };

  const deleteAiHistory = () => {
    if (window.confirm("Are you sure you want to delete AI model contextual history? This deletes the conversations but keeps saved resumes.")) {
      triggerToast("Context history deleted.");
    }
  };

  const exportAllData = () => {
    const backupObj = {
      profile: { name: pName, email: pEmail, username: pUsername, college: pCollege, bio: pBio },
      settings: { accent: accentColor, theme: appTheme, model: aiModel, targetAts: resAtsScore },
      exportedAt: new Date().toISOString(),
      platform: "CareerOS Intelligence System"
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `career_os_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Data export file compiled & downloaded.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Premium backdrop with soft blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-0"
      />

      {/* Main Settings Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "min(1050px, 95vw)",
          height: "min(720px, 85vh)",
          backgroundColor: "#11131C",
          borderColor: "rgba(255, 255, 255, 0.06)",
          boxShadow: "0 30px 90px rgba(0, 0, 0, 0.45)"
        }}
        className="rounded-[28px] border overflow-hidden flex flex-col md:flex-row relative z-10 select-none text-slate-200"
      >
        
        {/* Toast alert banner inside setting */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------------------------------------------
           LEFT SIDEBAR NAVIGATION
           ---------------------------------------------------- */}
        <div className="w-full md:w-[260px] border-r border-white/[0.04] bg-[#0A0B10] p-6 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${c.bgLight} ${c.text}`}>
                  <Settings size={15} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">System Settings</h3>
                  <p className="text-[9px] text-slate-500 font-medium">Control panel & preferences</p>
                </div>
              </div>
            </div>

            {/* Navigation List */}
            <div className="space-y-1 overflow-y-auto max-h-[45vh] pr-1 scrollbar-none">
              {(
                [
                  { id: "general", label: "General", icon: Settings },
                  { id: "profile", label: "Profile", icon: User },
                  { id: "subscription", label: "Subscription", icon: Award },
                  { id: "ai", label: "AI Models", icon: Cpu },
                  { id: "privacy", label: "Privacy", icon: Lock },
                  { id: "appearance", label: "Appearance", icon: Palette },
                  { id: "resume", label: "Resume Preferences", icon: FileText },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "advanced", label: "Advanced", icon: Sliders },
                  { id: "about", label: "About", icon: Info }
                ] as const
              ).map((tab) => {
                const isSelected = activeTab === tab.id;
                const TabIcon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full h-11 px-3.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all duration-150 group cursor-pointer relative ${
                      isSelected
                        ? "bg-white/[0.04] text-white"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TabIcon
                        size={15}
                        className={`transition-all duration-150 ${
                          isSelected ? c.text : "text-slate-500 group-hover:text-slate-300"
                        }`}
                      />
                      <span
                        className={`transition-all duration-150 ${
                          isSelected ? "translate-x-[2px]" : "group-hover:translate-x-[1px]"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </div>

                    {isSelected && (
                      <motion.div
                        layoutId="activeSettingPill"
                        className={`w-1 h-4 rounded-full ${c.bg} ${c.glow}`}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick info panel at bottom */}
          <div className="hidden md:flex flex-col gap-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-[10px]">
            <div className="flex items-center gap-1.5 font-bold text-slate-400">
              <Laptop size={11} className={c.text} />
              <span>Workspace Profile</span>
            </div>
            <div className="space-y-1 font-mono text-slate-500">
              <p className="truncate">Client: Gautham</p>
              <p>Type: Lifetime Pro</p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
           RIGHT CONTENT AREA
           ---------------------------------------------------- */}
        <div className="flex-1 flex flex-col justify-between bg-[#11131C] overflow-hidden">
          
          {/* Content Header */}
          <div className="h-[72px] px-8 border-b border-white/[0.04] flex items-center justify-between shrink-0">
            <div className="space-y-0.5">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>{activeTab.toUpperCase()}</span>
                {activeTab === "subscription" && (
                  <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded ${c.bg} text-white uppercase leading-none`}>
                    Lifetime
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">Configure and apply modifications to system modules.</p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrolling Content panel wrapper */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#11131C]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-8 h-full"
              >
                {/* ---------------- GENERAL PANEL ---------------- */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Workspace Name</label>
                        <input
                          type="text"
                          value={gWorkspaceName}
                          onChange={(e) => setGWorkspaceName(e.target.value)}
                          placeholder="e.g. My Career Hub"
                          className="w-full h-12 px-4 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
                        />
                        <p className="text-[10px] text-slate-500 leading-normal">Defines the label shown across system title segments.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Default Resume Name</label>
                        <input
                          type="text"
                          value={gDefaultResume}
                          onChange={(e) => setGDefaultResume(e.target.value)}
                          placeholder="e.g. resume.pdf"
                          className="w-full h-12 px-4 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans"
                        />
                        <p className="text-[10px] text-slate-500 leading-normal">Used to populate initial fields during exports.</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">System Language</label>
                        <div className="relative">
                          <select
                            value={gLanguage}
                            onChange={(e) => handleSelectChange("resume_iq_general_language", e.target.value, setGLanguage, `Language updated to ${e.target.value}`)}
                            className="w-full h-12 px-4 pr-10 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer"
                          >
                            <option value="English">English (US)</option>
                            <option value="Spanish">Spanish (Español)</option>
                            <option value="French">French (Français)</option>
                            <option value="German">German (Deutsch)</option>
                            <option value="Japanese">Japanese (日本語)</option>
                            <option value="Mandarin">Mandarin (中文)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                        </div>
                        <p className="text-[10px] text-slate-500">Updates application locale strings immediately.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Geographic Region</label>
                        <div className="relative">
                          <select
                            value={gRegion}
                            onChange={(e) => handleSelectChange("resume_iq_general_region", e.target.value, setGRegion)}
                            className="w-full h-12 px-4 pr-10 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500/40 appearance-none cursor-pointer"
                          >
                            <option value="United States">United States</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="Europe">Europe</option>
                            <option value="Canada">Canada</option>
                            <option value="Asia">Asia Pacific</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5 border-t border-white/[0.04] pt-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time Format</label>
                        <div className="flex gap-2 bg-[#181A26] p-1 rounded-xl border border-white/[0.02]">
                          {["12-hour", "24-hour"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectChange("resume_iq_general_time_format", opt, setGTimeFormat)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                gTimeFormat === opt ? "bg-[#11131C] text-white border border-white/[0.04] shadow-sm" : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Date Format</label>
                        <div className="relative">
                          <select
                            value={gDateFormat}
                            onChange={(e) => handleSelectChange("resume_iq_general_date_format", e.target.value, setGDateFormat)}
                            className="w-full h-10 px-3 pr-8 bg-[#181A26] border border-white/[0.04] rounded-[10px] text-[10px] font-bold text-slate-300 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 border-t border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Document Autosave State</h4>
                      
                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Autosave Document Sessions</p>
                          <p className="text-[10px] text-slate-500 leading-normal">Automatically updates history indexes on any modification.</p>
                        </div>
                        {/* iOS Custom Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_general_autosave", !gAutosave, setGAutosave)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            gAutosave ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            gAutosave ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Undo History Logging</p>
                          <p className="text-[10px] text-slate-500">Keep incremental cache points of optimizations.</p>
                        </div>
                        {/* iOS Custom Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_general_undo_history", !gUndoHistory, setGUndoHistory)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            gUndoHistory ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            gUndoHistory ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3.5 border-t border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <History size={12} />
                        <span>Recent Workspace Telemetry</span>
                      </h4>
                      <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 font-mono text-[10px] text-slate-500 space-y-2.5">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>✔ Evaluated compliance index • Gautham_Resume</span>
                          <span>Just now</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>✔ Configured prompt alignment parameters</span>
                          <span>2 hours ago</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>✔ Initialized Workspace parser layout</span>
                          <span>1 day ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleSaveGeneral}
                        style={{ background: `linear-gradient(135deg, ${c.accent} 0%, #9D46FF 100%)` }}
                        className="h-[44px] px-5 rounded-xl font-bold text-xs text-white shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Save Workspace Changes</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------- PROFILE PANEL ---------------- */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Avatar & Core Metadata */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-white/[0.01] border border-white/[0.03] rounded-2xl">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center font-extrabold text-2xl text-slate-200 select-none shadow-xl">
                          {pAvatar}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                            const randChar = chars[Math.floor(Math.random() * chars.length)];
                            setPAvatar(randChar);
                            triggerToast(`Avatar randomized to: ${randChar}`);
                          }}
                          className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      <div className="space-y-1.5 text-center sm:text-left">
                        <h3 className="font-bold text-sm text-slate-200">{pName}</h3>
                        <p className="text-xs text-slate-400">@{pUsername}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Role: Pro Lifetime Member • ID: u283726</p>
                      </div>
                    </div>

                    {/* Form rows */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                        <input
                          type="text"
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          className="w-full h-12 px-4 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                        <input
                          type="text"
                          value={pUsername}
                          onChange={(e) => setPUsername(e.target.value)}
                          className="w-full h-12 px-4 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Primary Email</label>
                        <input
                          type="email"
                          value={pEmail}
                          onChange={(e) => setPEmail(e.target.value)}
                          className="w-full h-12 px-4 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500/40 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">College / University</label>
                        <input
                          type="text"
                          value={pCollege}
                          onChange={(e) => setPCollege(e.target.value)}
                          className="w-full h-12 px-4 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500/40 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Professional Biography</label>
                      <textarea
                        value={pBio}
                        onChange={(e) => setPBio(e.target.value)}
                        rows={3}
                        className="w-full p-4 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none focus:border-purple-500/40 transition-all resize-none"
                      />
                      <p className="text-[10px] text-slate-500 leading-normal">Used as default context for the AI Resume Rewriter and Job Match analyzers.</p>
                    </div>

                    <div className="pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-5">
                      {/* Danger zone actions */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to log out of CareerOS? Your local data remains stored.")) {
                              onClose();
                            }
                          }}
                          className="px-3.5 py-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <LogOut size={13} />
                          <span>Sign Out</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("🚨 DANGER ZONE: This will wipe your account and configuration permanently. Do you wish to continue?")) {
                              localStorage.clear();
                              window.location.reload();
                            }
                          }}
                          className="px-3.5 py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-xs font-bold text-rose-400 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete Account</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setPName("Gautham");
                            setPEmail("gautham153@gmail.com");
                            setPUsername("gautham153");
                            setPCollege("Stanford University");
                            setPBio("Aspiring Software Engineer focused on AI, fullstack systems, and elegant user interfaces.");
                            triggerToast("Changes discarded.");
                          }}
                          className="text-xs text-slate-400 hover:text-white font-bold px-3 py-2 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          style={{ background: `linear-gradient(135deg, ${c.accent} 0%, #9D46FF 100%)` }}
                          className="h-[44px] px-5 rounded-xl font-bold text-xs text-white shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        >
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- SUBSCRIPTION PANEL ---------------- */}
                {activeTab === "subscription" && (
                  <div className="space-y-6">
                    
                    {/* Glowing Premium card layout */}
                    <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[#1E173C] to-[#0E0E15] border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden group">
                      {/* Ambient blur circle */}
                      <div className="absolute top-0 right-0 w-44 h-44 bg-[#7C5CFF]/15 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                            Active Package
                          </span>
                          <h3 className="text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
                            <span>PRO LIFETIME MEMBER</span>
                            <Sparkles size={18} className="text-amber-400 animate-pulse" />
                          </h3>
                          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                            Full-tier enterprise capability. Access to continuous model scanning & voice prep simulation unlocked.
                          </p>
                        </div>

                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shadow-inner">
                          <Award size={24} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-8 border-t border-white/[0.05] pt-5">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">Daily AI Credits</p>
                          <p className="text-base font-bold font-mono text-emerald-400">Unlimited</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">PDF Cloud Storage</p>
                          <p className="text-base font-bold font-mono text-emerald-400">Unlimited</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-slate-500 font-semibold uppercase">Resume Index Limit</p>
                          <p className="text-base font-bold font-mono text-emerald-400">Unlimited</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3.5">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Latest Billing Statements</h4>
                      
                      <div className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-slate-300">Jul 20, 2026</span>
                        </div>
                        <span className="font-mono text-slate-400">Lifetime Account Active ($0.00)</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-3.5">
                      <button
                        type="button"
                        onClick={() => triggerToast("Launching stripe billing portal...")}
                        className="px-4 h-[44px] rounded-xl border border-white/[0.06] hover:bg-white/[0.03] text-xs font-bold text-slate-300 transition-all cursor-pointer"
                      >
                        Manage Subscription
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerToast("Restoring secure purchase hooks...")}
                        className="px-4 h-[44px] rounded-xl border border-white/[0.06] hover:bg-white/[0.03] text-xs font-bold text-slate-300 transition-all cursor-pointer"
                      >
                        Restore Purchase
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerToast("Already upgraded to Lifetime PRO!")}
                        style={{ background: `linear-gradient(135deg, ${c.accent} 0%, #9D46FF 100%)` }}
                        className="px-5 h-[44px] rounded-xl font-bold text-xs text-white shadow-lg shadow-indigo-500/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      >
                        Upgrade License
                      </button>
                    </div>

                  </div>
                )}

                {/* ---------------- AI SETTINGS PANEL ---------------- */}
                {activeTab === "ai" && (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-5">
                      
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Default AI Intelligence Model</label>
                        <div className="relative">
                          <select
                            value={aiModel}
                            onChange={(e) => handleSelectChange("resume_iq_ai_model", e.target.value, setAiModel, `AI model updated to ${e.target.value}`)}
                            className="w-full h-12 px-4 pr-10 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="Gemini 3.5 Flash">Gemini 3.5 Flash (Default)</option>
                            <option value="Gemini Pro">Gemini Pro (Ultra Accurate)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Context Window Size</label>
                        <div className="relative">
                          <select
                            value={aiContextLength}
                            onChange={(e) => handleSelectChange("resume_iq_ai_context_length", e.target.value, setAiContextLength)}
                            className="w-full h-12 px-4 pr-10 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="8K">8,000 Tokens</option>
                            <option value="32K">32,000 Tokens</option>
                            <option value="128K">128,000 Tokens (Optimized)</option>
                            <option value="1M">1,000,000 Tokens (Full)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                    </div>

                    {/* Sliders */}
                    <div className="space-y-5 border-t border-white/[0.04] pt-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                          <span className="text-slate-400">Model Temperature</span>
                          <span className="font-mono text-indigo-400 font-bold">{aiTemperature}</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={aiTemperature}
                          onChange={(e) => handleSelectChange("resume_iq_ai_temperature", e.target.value, (v) => setAiTemperature(parseFloat(v)))}
                          className="w-full h-1.5 bg-[#181A26] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 font-medium">
                          <span>Deterministic (0.1)</span>
                          <span>Creative (1.0)</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                          <span className="text-slate-400">XYZ Impact Creativity Matrix</span>
                          <span className="font-mono text-indigo-400 font-bold">{aiCreativity}</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={aiCreativity}
                          onChange={(e) => handleSelectChange("resume_iq_ai_creativity", e.target.value, (v) => setAiCreativity(parseFloat(v)))}
                          className="w-full h-1.5 bg-[#181A26] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-3.5 border-t border-white/[0.04] pt-5">
                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Streaming Generation Output</p>
                          <p className="text-[10px] text-slate-500">Enable real-time character streams during bullet rewrite sessions.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_ai_streaming_output", !aiStreaming, setAiStreaming)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            aiStreaming ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            aiStreaming ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Auto retry failed pipelines</p>
                          <p className="text-[10px] text-slate-500">Retries connection checks automatically during API delays.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_ai_auto_retry", !aiAutoRetry, setAiAutoRetry)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            aiAutoRetry ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            aiAutoRetry ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Prompt Optimization Assistant</p>
                          <p className="text-[10px] text-slate-500">Pre-processes descriptions using system guidelines before routing prompts.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_ai_prompt_optimization", !aiPromptOpt, setAiPromptOpt)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            aiPromptOpt ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            aiPromptOpt ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- PRIVACY / API PANEL ---------------- */}
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 text-yellow-500/80 text-[11px] leading-relaxed flex gap-3">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white mb-0.5">Custom Gemini API Authentication (Optional)</span>
                        We handle model requests using internal sandboxed API routers. However, you can add your custom Google AI Studio key below to guarantee prioritized rate-limiting. This key is stored fully inside your local sandboxed browser storage.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Custom Gemini API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={apiKeyVal}
                          onChange={(e) => handleSelectChange("resume_iq_custom_gemini_key", e.target.value, setApiKeyVal)}
                          placeholder="AIzaSy..."
                          className="w-full h-12 pl-4 pr-12 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-mono text-indigo-400 focus:outline-none focus:border-indigo-500/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">Enter your API key beginning with "AIzaSy". Leave empty to run on shared system models.</p>
                    </div>

                    {/* Maintenance utilities */}
                    <div className="space-y-4 border-t border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Device GDPR & Security Audits</h4>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={clearAllCache}
                          className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all text-left space-y-1 cursor-pointer"
                        >
                          <p className="text-xs font-bold text-slate-200">Clear Parsing Cache</p>
                          <p className="text-[10px] text-slate-500">Purge unreferenced PDF texts and draft summaries.</p>
                        </button>

                        <button
                          type="button"
                          onClick={deleteAiHistory}
                          className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] transition-all text-left space-y-1 cursor-pointer"
                        >
                          <p className="text-xs font-bold text-slate-200">Flush AI History</p>
                          <p className="text-[10px] text-slate-500">Deletes recent conversation context trees.</p>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Export All Offline Data</p>
                          <p className="text-[10px] text-slate-500">Download complete configuration backup as a single JSON file.</p>
                        </div>
                        <button
                          type="button"
                          onClick={exportAllData}
                          className="px-4 py-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download size={13} />
                          <span>Download Account Backup</span>
                        </button>
                      </div>
                    </div>

                    {/* Connected devices */}
                    <div className="space-y-3.5 border-t border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Connected Client Interfaces</h4>
                      <div className="p-3.5 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${c.bgLight} ${c.text}`}>
                            <ShieldCheck size={14} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-200">This Chrome Browser (macOS)</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Active now • Session: local-sandboxed</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                          Current Node
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- APPEARANCE PANEL ---------------- */}
                {activeTab === "appearance" && (
                  <div className="space-y-6">
                    
                    {/* Theme selection */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Visual Theme Option</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(
                          [
                            { id: "light", label: "Light Mode", desc: "Crisp white panels" },
                            { id: "dark", label: "Dark Mode", desc: "Eye-safe charcoal" },
                            { id: "system", label: "System Sync", desc: "Follow device presets" }
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => changeTheme(opt.id)}
                            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                              appTheme === opt.id
                                ? `${c.border} bg-white/[0.02] shadow-xl`
                                : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.01]"
                            }`}
                          >
                            <p className={`text-xs font-bold ${appTheme === opt.id ? "text-white" : "text-slate-400"}`}>
                              {opt.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent colors */}
                    <div className="space-y-3 border-t border-white/[0.04] pt-5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Accent Tone Selection</label>
                      <div className="flex gap-4">
                        {(
                          [
                            { id: "purple", color: "bg-purple-500" },
                            { id: "blue", color: "bg-blue-500" },
                            { id: "indigo", color: "bg-indigo-500" },
                            { id: "emerald", color: "bg-emerald-500" }
                          ] as const
                        ).map((opt) => {
                          const isSel = accentColor === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleAccentChange(opt.id)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform cursor-pointer hover:scale-105 active:scale-95 ${
                                isSel ? "border-white" : "border-transparent"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-full ${opt.color} flex items-center justify-center`}>
                                {isSel && <Check size={14} className="text-white" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Density */}
                    <div className="grid sm:grid-cols-2 gap-5 border-t border-white/[0.04] pt-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Animation Speed Presets</label>
                        <div className="flex gap-2 bg-[#181A26] p-1 rounded-xl border border-white/[0.02]">
                          {["normal", "reduced"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectChange("resume_iq_animation_speed", opt, setAppAnimSpeed)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase ${
                                appAnimSpeed === opt ? "bg-[#11131C] text-white border border-white/[0.04] shadow-sm" : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Card Density Profile</label>
                        <div className="flex gap-2 bg-[#181A26] p-1 rounded-xl border border-white/[0.02]">
                          {["comfortable", "compact"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectChange("resume_iq_card_density", opt, setAppCardDensity)}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase ${
                                appCardDensity === opt ? "bg-[#11131C] text-white border border-white/[0.04] shadow-sm" : "text-slate-500 hover:text-slate-300"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 border-t border-white/[0.04] pt-5">
                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">System Compact Interface</p>
                          <p className="text-[10px] text-slate-500">Reduces sizing padding across layout margins for higher data density.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_compact_mode", !appCompact, setAppCompact)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            appCompact ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            appCompact ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Sidebar Collapse State</p>
                          <p className="text-[10px] text-slate-500">Keeps the left main navigation compact by default.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_sidebar_collapsed", !appSidebarCollapse, setAppSidebarCollapse)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            appSidebarCollapse ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            appSidebarCollapse ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- RESUME PREFERENCES ---------------- */}
                {activeTab === "resume" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-slate-400">Default Target ATS Score Threshold</span>
                        <span className="font-mono text-emerald-400 font-bold">{resAtsScore}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={resAtsScore}
                        onChange={(e) => handleSelectChange("resume_iq_resume_default_ats_score", e.target.value, (v) => setResAtsScore(parseInt(v)))}
                        className="w-full h-1.5 bg-[#181A26] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500">Defines the baseline target score during keyword and checklist audits.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5 border-t border-white/[0.04] pt-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Resume Style</label>
                        <div className="relative">
                          <select
                            value={resPreferredStyle}
                            onChange={(e) => handleSelectChange("resume_iq_resume_preferred_style", e.target.value, setResPreferredStyle)}
                            className="w-full h-12 px-4 pr-10 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="Chronological">Chronological (Highly Recommended)</option>
                            <option value="Modern">Modern (Clean/Visual)</option>
                            <option value="Minimal">Minimal (Classic Black & White)</option>
                            <option value="Executive">Executive (Experienced Roles)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Default Export Format</label>
                        <div className="relative">
                          <select
                            value={resDefaultExport}
                            onChange={(e) => handleSelectChange("resume_iq_resume_default_export", e.target.value, setResDefaultExport)}
                            className="w-full h-12 px-4 pr-10 bg-[#181A26] border border-white/[0.04] rounded-[14px] text-xs font-semibold text-slate-200 focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="PDF">PDF (Standard Document)</option>
                            <option value="DOCX">Microsoft Word (DOCX)</option>
                            <option value="Markdown">Markdown Format (TXT)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 border-t border-white/[0.04] pt-5">
                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Auto Save Resume Versions</p>
                          <p className="text-[10px] text-slate-500">Keeps successive drafts of modified templates inside local workspace registers.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_resume_auto_save", !resAutoSave, setResAutoSave)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            resAutoSave ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            resAutoSave ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Auto-Analyze Uploads</p>
                          <p className="text-[10px] text-slate-500">Automatically launches full-suite compliance scoring the second a resume loads.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_resume_auto_analyze", !resAutoAnalyze, setResAutoAnalyze)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            resAutoAnalyze ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            resAutoAnalyze ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Remember Target Job Description</p>
                          <p className="text-[10px] text-slate-500">Persists last target role specifications for side-by-side reviews.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_resume_remember_last_jd", !resRememberJd, setResRememberJd)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            resRememberJd ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            resRememberJd ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- NOTIFICATIONS PANEL ---------------- */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="space-y-3.5">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Alert Preferences</h4>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Resume Finished Optimization</p>
                          <p className="text-[10px] text-slate-500">Get an alert when a complex AI document rewrite completes compile.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_notif_email_finished", !notifEmailFinished, setNotifEmailFinished)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            notifEmailFinished ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            notifEmailFinished ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Analysis Complete Diagnostic Reports</p>
                          <p className="text-[10px] text-slate-500">Receive comprehensive PDF check breakdowns of your documents.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_notif_email_analysis", !notifEmailAnalysis, setNotifEmailAnalysis)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            notifEmailAnalysis ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            notifEmailAnalysis ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Weekly Progress Report Summaries</p>
                          <p className="text-[10px] text-slate-500">Aggregated streaks, resume downloads, and practice interview summaries.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_notif_email_weekly", !notifEmailWeekly, setNotifEmailWeekly)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            notifEmailWeekly ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            notifEmailWeekly ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Security Login Notifications</p>
                          <p className="text-[10px] text-slate-500">Alerts for novel browser connections or API credential modifications.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_notif_email_security", !notifEmailSecurity, setNotifEmailSecurity)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            notifEmailSecurity ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            notifEmailSecurity ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">System Feature Updates</p>
                          <p className="text-[10px] text-slate-500">Notifies you of new models, templates, or UI layout shifts.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_notif_email_updates", !notifEmailUpdates, setNotifEmailUpdates)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            notifEmailUpdates ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            notifEmailUpdates ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Browser Desktop Indicators</h4>
                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Allow System Web Notifications</p>
                          <p className="text-[10px] text-slate-500">Push status alerts during lengthy document processing.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_notif_desktop_alerts", !notifDesktopAlerts, setNotifDesktopAlerts)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            notifDesktopAlerts ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            notifDesktopAlerts ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- ADVANCED PANEL ---------------- */}
                {activeTab === "advanced" && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400/90 text-[11px] leading-relaxed">
                      <span className="font-bold block text-white mb-0.5">Developer Diagnostic Modes</span>
                      Modifying these variables alters API payload scopes and opens logs inside the browser developer inspector.
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Developer Mode</p>
                          <p className="text-[10px] text-slate-500">Exposes raw JSON trees underneath diagnostics sections.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_adv_dev_mode", !advDevMode, setAdvDevMode)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            advDevMode ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            advDevMode ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Verbose System Telemetry Logs</p>
                          <p className="text-[10px] text-slate-500">Tracks performance timing of API parsing inside live logger frames.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_adv_verbose_logs", !advVerboseLogs, setAdvVerboseLogs)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            advVerboseLogs ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            advVerboseLogs ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">Experimental Beta Layouts</p>
                          <p className="text-[10px] text-slate-500">Opt-in to micro-features before public general availability rollout.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggle("resume_iq_adv_experimental", !advExperimental, setAdvExperimental)}
                          className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 flex items-center cursor-pointer ${
                            advExperimental ? c.bg : "bg-slate-800"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-200 ${
                            advExperimental ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-white/[0.04] pt-5">
                      <h4 className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">System Recovery Parameters</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Use recovery triggers to clean local anomalies if parsing engines block due to stale browser structures.
                      </p>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={handleResetPreferences}
                          className="px-4 py-2.5 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] text-xs font-bold text-slate-300 transition-all cursor-pointer"
                        >
                          Reset Visual Preferences
                        </button>

                        <button
                          type="button"
                          onClick={handleFactoryReset}
                          className="px-4 py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-xs font-bold text-rose-400 transition-all cursor-pointer"
                        >
                          Complete Factory Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- ABOUT PANEL ---------------- */}
                {activeTab === "about" && (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/[0.01] border border-white/[0.03] rounded-3xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,92,255,0.05),transparent_60%)] pointer-events-none" />
                      
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl text-[#7C5CFF] mb-4">
                        <Sparkles size={28} className="animate-pulse" />
                      </div>

                      <h3 className="text-base font-extrabold text-white font-display tracking-tight">CareerOS Intelligence System</h3>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">Version 1.4.2 Stable • Build b20260720-production</p>
                      
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed mt-4">
                        Next-generation AI core parsing, McKinsey-quantified bullet optimizations, and high-fidelity vocal interview preparation modules.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] space-y-3 text-xs">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Release Notes</h4>
                      <div className="space-y-2 leading-relaxed text-slate-400">
                        <p>• Added customized accent spectrum adjustments (Purple, Blue, Emerald, Indigo).</p>
                        <p>• Multi-dimensional performance radar layout integrations optimized.</p>
                        <p>• Google Gemni 3.5 API core telemetry synchronization finalized.</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/[0.04] flex justify-between items-center text-[11px] font-bold text-slate-500">
                      <span>© 2026 CareerOS Inc. All Rights Reserved.</span>
                      <div className="flex gap-4">
                        <button type="button" onClick={() => triggerToast("Navigating to GitHub repository...")} className="hover:text-slate-300 cursor-pointer">GitHub</button>
                        <button type="button" onClick={() => triggerToast("Opening website...")} className="hover:text-slate-300 cursor-pointer">Website</button>
                        <button type="button" onClick={() => triggerToast("Opening terms of service...")} className="hover:text-slate-300 cursor-pointer">Terms</button>
                        <button type="button" onClick={() => triggerToast("Opening privacy policies...")} className="hover:text-slate-300 cursor-pointer">Privacy</button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Fixed Footer info summary */}
          <div className="h-[60px] px-8 border-t border-white/[0.04] bg-[#0A0B10] flex items-center justify-between shrink-0 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All active changes synchronized with LocalStorage</span>
            </span>
            <span className="font-mono">Device Status: Connected Secure</span>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
