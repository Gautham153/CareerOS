/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { ResumeAnalysisResult, UserHistoryItem } from "../types";
import { extractTextFromFile } from "../utils/fileParser";
import { apiService, ImprovedBulletResult } from "../services/api";
import { useApp } from "./AppContext";
import { databaseService } from "../services/firebase";

interface AnalysisContextType {
  isAnalyzing: boolean;
  isImproving: boolean;
  analysisResult: ResumeAnalysisResult | null;
  currentFile: { name: string; size: number } | null;
  activeResumeText: string | null;
  setActiveResumeText: (text: string | null) => void;
  history: UserHistoryItem[];
  error: string | null;
  errorDetails: any | null;
  analyzeResumeFile: (file: File) => Promise<ResumeAnalysisResult>;
  optimizeBullet: (bullet: string, jobTitle?: string, industry?: string) => Promise<ImprovedBulletResult>;
  clearAnalysis: () => void;
  deleteHistoryItem: (id: string) => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  toggleFavoriteHistoryItem: (id: string) => void;
  renameHistoryItem: (id: string, newName: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, analyses, refreshUserData, addActivity, plan } = useApp();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(null);
  const [activeResumeText, setActiveResumeText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      try {
        const storedActive = localStorage.getItem(`resume_iq_active_text_${user.uid}`);
        setActiveResumeText(storedActive || null);
      } catch {
        setActiveResumeText(null);
      }
    } else {
      setAnalysisResult(null);
      setCurrentFile(null);
      setActiveResumeText(null);
    }
  }, [user]);

  /**
   * Main orchestrator for parsing, analyzing, and persisting resumes.
   */
  const analyzeResumeFile = async (file: File): Promise<ResumeAnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);
    setErrorDetails(null);
    setCurrentFile({ name: file.name, size: file.size });

    try {
      // 1. Check daily limit if FREE tier
      if (plan === "FREE") {
        const todayStr = new Date().toDateString();
        const dailyScans = analyses.filter(item => new Date(item.timestamp).toDateString() === todayStr);
        if (dailyScans.length >= 5) {
          throw new Error("You have reached the daily limit of 5 resume analyses for the Free plan. Upgrade to Pro for unlimited analyses!");
        }
      }

      // 2. Client-side extraction to offload server compute
      const { text, wordCount } = await extractTextFromFile(file);
      setActiveResumeText(text);
      if (user) {
        try {
          localStorage.setItem(`resume_iq_active_text_${user.uid}`, text);
        } catch (err) {
          console.error("Failed to save active resume text to localStorage:", err);
        }
      }

      // 3. Transmit extracted text to Express for server-side Gemini processing
      const analysis = await apiService.analyzeResume({
        text,
        wordCount,
        fileName: file.name,
      });

      setAnalysisResult(analysis);

      // 4. Save to history
      if (user) {
        const newHistoryItem: UserHistoryItem = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          fileName: file.name,
          fileSize: file.size,
          timestamp: new Date().toISOString(),
          score: analysis.scores.overall,
          analysis,
          rawText: text,
        };

        await databaseService.saveUserData(user.uid, "analyses", newHistoryItem);
        await addActivity(`Completed ATS score analysis for resume: ${file.name}`, "analysis");
        await refreshUserData();
      }

      return analysis;
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred during resume analysis.";
      setError(msg);
      if (err.details) {
        setErrorDetails(err.details);
      }
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Orchestrates optimized rewriting of a single resume bullet point.
   */
  const optimizeBullet = async (
    bullet: string,
    jobTitle?: string,
    industry?: string
  ): Promise<ImprovedBulletResult> => {
    setIsImproving(true);
    setError(null);

    try {
      const result = await apiService.improveBulletPoint({
        bulletPoint: bullet,
        jobTitle,
        industry,
      });
      if (user) {
        await addActivity(`Optimized accomplishment bullet point for role: ${jobTitle || "General"}`, "ai");
      }
      return result;
    } catch (err: any) {
      const msg = err.message || "Failed to optimize the achievement bullet point.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsImproving(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysisResult(null);
    setCurrentFile(null);
    setActiveResumeText(null);
    if (user) {
      try {
        localStorage.removeItem(`resume_iq_active_text_${user.uid}`);
      } catch {}
    }
    setError(null);
    setErrorDetails(null);
  };

  const deleteHistoryItem = async (id: string) => {
    if (!user) return;
    await databaseService.deleteUserData(user.uid, "analyses", id);
    await addActivity("Deleted a saved resume analysis", "history");
    await refreshUserData();
    
    // If current active view is deleted, clear it
    const activeItem = analyses.find(h => h.id === id);
    if (activeItem && currentFile && activeItem.fileName === currentFile.name) {
      clearAnalysis();
    }
  };

  const loadFromHistory = (id: string) => {
    const item = analyses.find((h) => h.id === id);
    if (item) {
      setAnalysisResult(item.analysis);
      setCurrentFile({ name: item.fileName, size: item.fileSize });
      if (item.rawText) {
        setActiveResumeText(item.rawText);
        if (user) {
          try {
            localStorage.setItem(`resume_iq_active_text_${user.uid}`, item.rawText);
          } catch {}
        }
      }
      setError(null);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    for (const item of analyses) {
      await databaseService.deleteUserData(user.uid, "analyses", item.id);
    }
    await addActivity("Wiped all resume scan histories", "history");
    await refreshUserData();
    clearAnalysis();
  };

  const toggleFavoriteHistoryItem = async (id: string) => {
    if (!user) return;
    const item = analyses.find(h => h.id === id);
    if (item) {
      const updated = { ...item, isFavorite: !item.isFavorite };
      await databaseService.saveUserData(user.uid, "analyses", updated);
      await refreshUserData();
    }
  };

  const renameHistoryItem = async (id: string, newName: string) => {
    if (!newName.trim() || !user) return;
    const item = analyses.find(h => h.id === id);
    if (item) {
      const updated = { ...item, fileName: newName.trim() };
      await databaseService.saveUserData(user.uid, "analyses", updated);
      await addActivity(`Renamed resume scan record to: ${newName.trim()}`, "history");
      await refreshUserData();
      
      if (currentFile && item.fileName === currentFile.name) {
        setCurrentFile({ name: newName.trim(), size: currentFile.size });
      }
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        isAnalyzing,
        isImproving,
        analysisResult,
        currentFile,
        activeResumeText,
        setActiveResumeText,
        history: analyses as UserHistoryItem[],
        error,
        errorDetails,
        analyzeResumeFile,
        optimizeBullet,
        clearAnalysis,
        deleteHistoryItem,
        loadFromHistory,
        clearHistory,
        toggleFavoriteHistoryItem,
        renameHistoryItem,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = (): AnalysisContextType => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysisContext must be used within an AnalysisProvider");
  }
  return context;
};
