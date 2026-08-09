/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
}

export interface IssueItem {
  id: string;
  category: "content" | "format" | "style" | "brevity" | "skills";
  severity: "critical" | "warning" | "optimized";
  title: string;
  description: string;
  suggestion: string;
  originalText?: string;
  revisedText?: string;
  isLocked?: boolean;
}

export interface ScoreCategory {
  score: number;
  maxScore: number;
  issuesCount: number;
  status: "excellent" | "average" | "poor";
}

export interface AnalysisScores {
  overall: number;
  content: ScoreCategory;
  brevity: ScoreCategory;
  style: ScoreCategory;
  sections: ScoreCategory;
  skills: ScoreCategory;
}

export interface ResumeSection {
  title: string;
  found: boolean;
  score: number;
  feedback: string;
}

export interface ResumeAnalysisResult {
  metadata: {
    wordCount: number;
    estimatedReadTimeMinutes: number;
    detectedFormat: string;
  };
  contactInfo: ContactInfo;
  scores: AnalysisScores;
  issues: IssueItem[];
  detectedSkills: string[];
  missingSkillsSuggestion: string[];
  sectionsBreakdown: ResumeSection[];
  suggestedProfileSummary?: string;
}

export interface UserHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  timestamp: string;
  score: number;
  analysis: ResumeAnalysisResult;
  isFavorite?: boolean;
  rawText?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAnonymous: boolean;
}
