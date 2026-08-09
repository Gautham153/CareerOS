/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, databaseService, storageService, UserProfile } from "../services/firebase";

export interface SystemNotification {
  id: string;
  text: string;
  date: string;
  unread: boolean;
  type: "info" | "success" | "warning" | "error";
}

export interface ActivityItem {
  id: string;
  type: string;
  text: string;
  timestamp: string;
}

interface AppContextType {
  // Auth & Session
  user: any | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  
  // Subscription Architecture
  plan: "FREE" | "PRO" | "PREMIUM";
  subscriptionStatus: string;
  upgradeToPro: () => Promise<void>;
  upgradeToPlan: (targetPlan: "PRO" | "PREMIUM") => Promise<void>;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  
  // Settings (Firestore & localStorage backed)
  theme: "light" | "dark" | "system";
  setTheme: (t: "light" | "dark" | "system") => void;
  accentColor: "purple" | "blue" | "indigo" | "emerald";
  setAccentColor: (c: "purple" | "blue" | "indigo" | "emerald") => void;
  compactMode: boolean;
  setCompactMode: (v: boolean) => void;
  language: string;
  setLanguage: (l: string) => void;
  notificationsEnabled: {
    emailFinished: boolean;
    emailAnalysis: boolean;
    emailWeekly: boolean;
    emailSecurity: boolean;
    emailUpdates: boolean;
    desktopAlerts: boolean;
  };
  setNotificationsEnabled: (n: any) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  animationSpeed: "slow" | "normal" | "fast";
  setAnimationSpeed: (s: "slow" | "normal" | "fast") => void;
  aiModel: string;
  setAiModel: (m: string) => void;
  resumeDefaults: {
    preferredStyle: string;
    atsScore: number;
    defaultExport: string;
  };
  setResumeDefaults: (d: any) => void;
  autosave: boolean;
  setAutosave: (v: boolean) => void;
  
  // Notification center
  systemNotifications: SystemNotification[];
  addSystemNotification: (text: string, type?: "info" | "success" | "warning" | "error") => void;
  clearUnreadNotifications: () => void;
  
  // User Data syncing lists
  resumes: any[];
  analyses: any[];
  reports: any[];
  interviewHistory: any[];
  jobMatches: any[];
  activity: ActivityItem[];
  
  // Global search & session
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  
  // Sync operators
  refreshUserData: () => Promise<void>;
  addActivity: (text: string, type?: string) => Promise<void>;
  uploadResumeFile: (file: File) => Promise<any>;
  deleteReport: (id: string) => Promise<void>;
  saveReport: (report: any) => Promise<void>;
  saveJobMatch: (match: any) => Promise<void>;
  saveInterviewSession: (session: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Subscription
  const [plan, setPlan] = useState<"FREE" | "PRO" | "PREMIUM">("FREE");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("ACTIVE");
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Settings
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("dark");
  const [accentColor, setAccentColorState] = useState<"purple" | "blue" | "indigo" | "emerald">("purple");
  const [compactMode, setCompactModeState] = useState(false);
  const [language, setLanguageState] = useState("English");
  const [notificationsEnabled, setNotificationsEnabledState] = useState({
    emailFinished: true,
    emailAnalysis: true,
    emailWeekly: false,
    emailSecurity: true,
    emailUpdates: true,
    desktopAlerts: true
  });
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
  const [animationSpeed, setAnimationSpeedState] = useState<"slow" | "normal" | "fast">("normal");
  const [aiModel, setAiModelState] = useState("Gemini 3.5 Flash");
  const [resumeDefaults, setResumeDefaultsState] = useState({
    preferredStyle: "Modern",
    atsScore: 85,
    defaultExport: "PDF"
  });
  const [autosave, setAutosaveState] = useState(true);
  
  // Lists
  const [resumes, setResumes] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  
  // Global search
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  
  // Notifications inbox
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([
    { id: "1", text: "Welcome to CareerOS Intelligence Suite", date: "Just now", unread: true, type: "info" }
  ]);

  // Handle active session listeners
  useEffect(() => {
    const unsub = authService.onAuthStateChangedListener(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Sync user settings & profile from database
        try {
          const profile = await databaseService.getUserProfile(firebaseUser.uid);
          
          setPlan(profile.plan || "FREE");
          setSubscriptionStatus(profile.subscriptionStatus || "ACTIVE");
          setThemeState(profile.theme || "dark");
          setAccentColorState(profile.accentColor || "purple");
          setCompactModeState(profile.compactMode || false);
          setLanguageState(profile.language || "English");
          if (profile.notifications) {
            setNotificationsEnabledState(profile.notifications);
          }
          setSidebarCollapsedState(profile.sidebarCollapsed || false);
          setAnimationSpeedState(profile.animationSpeed || "normal");
          setAiModelState(profile.aiModel || "Gemini 3.5 Flash");
          setAutosaveState(profile.autosave !== false);
          
          // Apply initial HTML classes
          applyThemeClass(profile.theme || "dark");
          applyAccentStyles(profile.accentColor || "purple");
          
          // Refresh database collections
          const fetchedResumes = await databaseService.getUserData(firebaseUser.uid, "resumes");
          const fetchedAnalyses = await databaseService.getUserData(firebaseUser.uid, "analyses");
          const fetchedReports = await databaseService.getUserData(firebaseUser.uid, "reports");
          const fetchedInterview = await databaseService.getUserData(firebaseUser.uid, "interviewHistory");
          const fetchedJob = await databaseService.getUserData(firebaseUser.uid, "jobMatches");
          const fetchedActivity = await databaseService.getUserData(firebaseUser.uid, "activity");
          
          setResumes(fetchedResumes);
          setAnalyses(fetchedAnalyses);
          setReports(fetchedReports);
          setInterviewHistory(fetchedInterview);
          setJobMatches(fetchedJob);
          setActivity(fetchedActivity);
          
        } catch (e) {
          console.error("Failed to load user profile databases", e);
          setPlan("FREE");
          setSubscriptionStatus("ACTIVE");
        }
      } else {
        setUser(null);
        setPlan("FREE");
        setSubscriptionStatus("ACTIVE");
        // Reset states
        setResumes([]);
        setAnalyses([]);
        setReports([]);
        setInterviewHistory([]);
        setJobMatches([]);
        setActivity([]);
      }
      setLoading(false);
    });
    
    return unsub;
  }, []);

  const refreshUserData = async () => {
    if (!user) return;
    const uid = user.uid;
    const fetchedResumes = await databaseService.getUserData(uid, "resumes");
    const fetchedAnalyses = await databaseService.getUserData(uid, "analyses");
    const fetchedReports = await databaseService.getUserData(uid, "reports");
    const fetchedInterview = await databaseService.getUserData(uid, "interviewHistory");
    const fetchedJob = await databaseService.getUserData(uid, "jobMatches");
    const fetchedActivity = await databaseService.getUserData(uid, "activity");
    
    setResumes(fetchedResumes);
    setAnalyses(fetchedAnalyses);
    setReports(fetchedReports);
    setInterviewHistory(fetchedInterview);
    setJobMatches(fetchedJob);
    setActivity(fetchedActivity);
  };

  const addActivity = async (text: string, type: string = "info") => {
    if (!user) return;
    const newAct: ActivityItem = {
      id: "act_" + Math.random().toString(36).substring(2, 9),
      type,
      text,
      timestamp: new Date().toISOString()
    };
    await databaseService.saveUserData(user.uid, "activity", newAct);
    setActivity(prev => [newAct, ...prev]);
  };

  const uploadResumeFile = async (file: File) => {
    if (!user) throw new Error("User must be logged in to upload files.");
    const uploadResult = await storageService.uploadResume(user.uid, file);
    await addActivity(`Uploaded resume: ${file.name}`, "resume");
    await refreshUserData();
    return uploadResult;
  };

  // Sync settings helper
  const syncSetting = async (key: keyof UserProfile, value: any) => {
    try {
      localStorage.setItem(`resume_iq_${String(key)}`, String(value));
    } catch {}
    if (user) {
      await databaseService.updateUserProfile(user.uid, { [key]: value });
    }
  };

  const setTheme = (t: "light" | "dark" | "system") => {
    setThemeState(t);
    syncSetting("theme", t);
    applyThemeClass(t);
  };

  const setAccentColor = (c: "purple" | "blue" | "indigo" | "emerald") => {
    setAccentColorState(c);
    syncSetting("accentColor", c);
    applyAccentStyles(c);
  };

  const setCompactMode = (v: boolean) => {
    setCompactModeState(v);
    syncSetting("compactMode", v);
  };

  const setLanguage = (l: string) => {
    setLanguageState(l);
    syncSetting("language", l);
  };

  const setNotificationsEnabled = (n: any) => {
    setNotificationsEnabledState(n);
    syncSetting("notifications", n);
  };

  const setSidebarCollapsed = (v: boolean) => {
    setSidebarCollapsedState(v);
    syncSetting("sidebarCollapsed", v);
  };

  const setAnimationSpeed = (s: "slow" | "normal" | "fast") => {
    setAnimationSpeedState(s);
    syncSetting("animationSpeed", s);
  };

  const setAiModel = (m: string) => {
    setAiModelState(m);
    syncSetting("aiModel", m);
  };

  const setResumeDefaults = (d: any) => {
    setResumeDefaultsState(d);
    // Deep store
    if (user) {
      databaseService.updateUserProfile(user.uid, {
        resumeDefaults: d
      } as any);
    }
  };

  const setAutosave = (v: boolean) => {
    setAutosaveState(v);
    syncSetting("autosave", v);
  };

  const logout = async () => {
    await authService.signOutUser();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await databaseService.updateUserProfile(user.uid, updates);
    setUser((prev: any) => ({
      ...prev,
      displayName: updates.displayName || prev?.displayName,
      photoURL: updates.photoURL || prev?.photoURL
    }));
    await addActivity("Updated profile details", "profile");
  };

  const deleteUserAccount = async () => {
    if (!user) return;
    // Simply clear profile and logout simulator-side
    await authService.signOutUser();
    setUser(null);
  };

  const upgradeToPlan = async (targetPlan: "PRO" | "PREMIUM") => {
    setPlan(targetPlan);
    setSubscriptionStatus("ACTIVE");
    try {
      localStorage.setItem("resume_iq_plan", targetPlan);
    } catch {}
    if (user) {
      await databaseService.updateUserProfile(user.uid, {
        plan: targetPlan,
        subscriptionStatus: "ACTIVE",
        updatedAt: new Date().toISOString()
      });
      await addActivity(`Upgraded account plan to ${targetPlan} tier`, "billing");
    }
    addSystemNotification(`Congratulations! You have successfully upgraded to CareerOS ${targetPlan} plan.`, "success");
  };

  const upgradeToPro = async () => {
    await upgradeToPlan("PRO");
  };

  const addSystemNotification = (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const newNotif: SystemNotification = {
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      text,
      date: "Just now",
      unread: true,
      type
    };
    setSystemNotifications(prev => [newNotif, ...prev]);
  };

  const clearUnreadNotifications = () => {
    setSystemNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteReport = async (id: string) => {
    if (!user) return;
    await databaseService.deleteUserData(user.uid, "reports", id);
    setReports(prev => prev.filter(r => r.id !== id));
    await addActivity("Deleted an analytical report", "history");
  };

  const saveReport = async (report: any) => {
    if (!user) return;
    await databaseService.saveUserData(user.uid, "reports", report);
    setReports(prev => {
      const idx = prev.findIndex(r => r.id === report.id);
      if (idx !== -1) {
        const u = [...prev];
        u[idx] = report;
        return u;
      }
      return [report, ...prev];
    });
    await addActivity(`Saved analytical report: ${report.name || "ATS Report"}`, "history");
  };

  const saveJobMatch = async (match: any) => {
    if (!user) return;
    await databaseService.saveUserData(user.uid, "jobMatches", match);
    setJobMatches(prev => {
      const idx = prev.findIndex(m => m.id === match.id);
      if (idx !== -1) {
        const u = [...prev];
        u[idx] = match;
        return u;
      }
      return [match, ...prev];
    });
    await addActivity(`Saved job match index for role: ${match.role || "Job Match"}`, "history");
  };

  const saveInterviewSession = async (session: any) => {
    if (!user) return;
    await databaseService.saveUserData(user.uid, "interviewHistory", session);
    setInterviewHistory(prev => {
      const idx = prev.findIndex(s => s.id === session.id);
      if (idx !== -1) {
        const u = [...prev];
        u[idx] = session;
        return u;
      }
      return [session, ...prev];
    });
    await addActivity(`Completed AI Interview session for role: ${session.role || "Interview"}`, "history");
  };

  // Helper theme injector
  const applyThemeClass = (t: string) => {
    const root = document.documentElement;
    let makeDark = t === "dark";
    if (t === "system") {
      makeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    if (makeDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  const applyAccentStyles = (c: string) => {
    const root = document.documentElement;
    // Map theme custom styles if applicable, otherwise keep standard classes
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        logout,
        updateProfile,
        deleteUserAccount,
        plan,
        subscriptionStatus,
        upgradeToPro,
        upgradeToPlan,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        theme,
        setTheme,
        accentColor,
        setAccentColor,
        compactMode,
        setCompactMode,
        language,
        setLanguage,
        notificationsEnabled,
        setNotificationsEnabled,
        sidebarCollapsed,
        setSidebarCollapsed,
        animationSpeed,
        setAnimationSpeed,
        aiModel,
        setAiModel,
        resumeDefaults,
        setResumeDefaults,
        autosave,
        setAutosave,
        systemNotifications,
        addSystemNotification,
        clearUnreadNotifications,
        resumes,
        analyses,
        reports,
        interviewHistory,
        jobMatches,
        activity,
        globalSearchQuery,
        setGlobalSearchQuery,
        refreshUserData,
        addActivity,
        uploadResumeFile,
        deleteReport,
        saveReport,
        saveJobMatch,
        saveInterviewSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
