/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAnalysisContext } from "../context/AnalysisContext";

/**
 * Custom hook to easily consume the CareerOS analysis state and controls.
 */
export function useAnalysis() {
  const context = useAnalysisContext();
  
  return {
    isAnalyzing: context.isAnalyzing,
    isImproving: context.isImproving,
    analysisResult: context.analysisResult,
    currentFile: context.currentFile,
    activeResumeText: context.activeResumeText,
    setActiveResumeText: context.setActiveResumeText,
    history: context.history,
    error: context.error,
    errorDetails: context.errorDetails,
    analyzeResume: context.analyzeResumeFile,
    improveBullet: context.optimizeBullet,
    clearAnalysis: context.clearAnalysis,
    deleteHistoryItem: context.deleteHistoryItem,
    loadFromHistory: context.loadFromHistory,
    clearHistory: context.clearHistory,
    toggleFavoriteHistoryItem: context.toggleFavoriteHistoryItem,
    renameHistoryItem: context.renameHistoryItem,
  };
}
