/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResumeAnalysisResult } from "../types";

export interface AnalyzePayload {
  text: string;
  wordCount: number;
  fileName: string;
}

export interface ImproveBulletPayload {
  bulletPoint: string;
  jobTitle?: string;
  industry?: string;
}

export interface ImprovedBulletResult {
  original: string;
  improved: string;
  impactScoreBefore: number;
  impactScoreAfter: number;
  explanation: string;
}

export interface PriorityImprovement {
  original: string;
  optimized: string;
  reason: string;
  priority: string;
}

export interface JobMatchResult {
  match_score: number;
  ats_compatibility: string;
  matching_skills: string[];
  missing_skills: string[];
  matching_keywords: string[];
  missing_keywords: string[];
  required_tools: string[];
  soft_skills: string[];
  hard_skills: string[];
  resume_strengths: string[];
  resume_weaknesses: string[];
  recommendations: string[];
  priority_improvements: PriorityImprovement[];
  section_scores: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    keywords: number;
  };
  interview_probability: string;
  salary_fit: string;
  hiring_manager_summary: string;
  optimized_summary: string;
  growth_opportunities?: string;
  interview_readiness?: string;
  career_advice?: string;
  role_insights?: {
    role_overview: string;
    average_required_skills: string[];
    current_readiness: number;
    top_missing_skills: string[];
    most_important_technologies: string[];
    typical_responsibilities: string[];
    learning_priority: string[];
    career_growth: string;
  };
  learning_roadmap?: {
    week: string;
    title: string;
    tasks: string[];
  }[];
  skill_gap?: {
    skill: string;
    required: number;
    current: number;
  }[];
}

export interface JobMatchPayload {
  resumeText: string;
  jobDescription?: string;
  targetRole?: string;
  jobPreferences?: {
    preferredLocation?: string;
    experienceLevel?: string;
    employmentType?: string;
    industry?: string;
    salaryExpectation?: string;
  };
}

export interface CareerRoadmapPayload {
  resumeText?: string;
  careerGoal: string;
  experienceLevel: string;
  targetTimeline: string;
}

export interface CareerRoadmapResult {
  currentSkillLevel: string;
  readinessScore: number;
  estimatedTime: string;
  missingSkills: string[];
  learningPath: {
    month: string;
    title: string;
    description: string;
    tasks: string[];
    milestone: string;
  }[];
  recommendedCourses: {
    name: string;
    estimatedHours: string;
    difficulty: string;
    provider?: string;
  }[];
  recommendedProjects: {
    name: string;
    description: string;
    techStack: string[];
    difficulty: string;
  }[];
  certifications: string[];
  portfolioSuggestions: string[];
  interviewPreparation: string[];
}

class ApiService {
  private getHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = "An error occurred while connecting to the server.";
      let details: any = null;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        details = errorData.details || null;
      } catch {
        // Fallback to text if JSON parsing fails
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {
          // Keep default error
        }
      }
      const err = new Error(errorMessage);
      if (details) {
        (err as any).details = details;
      }
      throw err;
    }
    return response.json() as Promise<T>;
  }

  /**
   * Sends parsed resume text to the Express backend for Gemini AI Analysis.
   */
  async analyzeResume(payload: AnalyzePayload): Promise<ResumeAnalysisResult> {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<ResumeAnalysisResult>(response);
  }

  /**
   * Improves a single bullet point/accomplishment for ATS compatibility and impact.
   */
  async improveBulletPoint(payload: ImproveBulletPayload): Promise<ImprovedBulletResult> {
    const response = await fetch("/api/improve-bullet", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<ImprovedBulletResult>(response);
  }

  /**
   * Compares parsed resume text against a job description.
   */
  async matchJobDescription(payload: JobMatchPayload): Promise<JobMatchResult> {
    const response = await fetch("/api/job-match", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<JobMatchResult>(response);
  }

  /**
   * Parses raw resume text into distinct logical sections.
   */
  async parseResumeSections(text: string): Promise<{
    summary: string;
    education: string;
    projects: string;
    experience: string;
    skills: string;
    achievements: string;
    certifications: string;
    technicalSkills: string;
    softSkills: string;
  }> {
    const response = await fetch("/api/parse-sections", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ text }),
    });
    return this.handleResponse(response);
  }

  /**
   * Rewrites a specific resume section based on guidelines and options.
   */
  async rewriteResumeSection(payload: {
    sectionName: string;
    currentText: string;
    instruction: string;
    tone: string;
    estimatedScoreBefore: number;
  }): Promise<{
    improved: string;
    explanation: string;
    addedKeywords: string[];
    removedWords: string[];
    suggestedSkills: string[];
    missingSkills: string[];
    estimatedScoreAfter: number;
    userQuestion?: string;
  }> {
    const response = await fetch("/api/rewrite-section", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  /**
   * Generates a tailored cover letter.
   */
  async generateCoverLetter(payload: {
    resumeText: string;
    targetRole?: string;
    jobDescription?: string;
    jobPreferences?: any;
  }): Promise<string> {
    const response = await fetch("/api/generate-cover-letter", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await this.handleResponse<{ coverLetter: string }>(response);
    return data.coverLetter;
  }

  /**
   * Generates highly-tailored interview preparation questions and sample answers.
   */
  async generateInterviewPrep(payload: {
    resumeText: string;
    targetRole?: string;
    jobDescription?: string;
    jobPreferences?: any;
  }): Promise<{ question: string; answer: string; strategy: string }[]> {
    const response = await fetch("/api/generate-interview-prep", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await this.handleResponse<{ prep: { question: string; answer: string; strategy: string }[] }>(response);
    return data.prep;
  }

  /**
   * Generates custom questions for the AI Interview Coach.
   */
  async generateCoachQuestions(payload: {
    resumeText: string;
    optimizedResumeText?: string;
    targetRole?: string;
    jobDescription?: string;
    jobMatchResults?: string;
    interviewType?: string;
    difficulty?: string;
    style?: string;
    company?: string;
    count?: number;
  }): Promise<{ questions: { id: string; question: string; category: string; expectedPoints: string[]; hint: string }[] }> {
    const response = await fetch("/api/coach/questions", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  /**
   * Evaluates an interview answer for the AI Interview Coach.
   */
  async evaluateCoachAnswer(payload: {
    question: string;
    expectedPoints: string[];
    userAnswer: string;
    resumeText: string;
    targetRole?: string;
    jobDescription?: string;
    interviewType?: string;
    difficulty?: string;
    style?: string;
  }): Promise<{ evaluation: { score: number; feedback: string; idealAnswer: string; pointsMatched: string[]; pointsMissed: string[]; recruiterTip: string } }> {
    const response = await fetch("/api/coach/evaluate", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  /**
   * Generates a personalized AI career roadmap.
   */
  async generateCareerRoadmap(payload: CareerRoadmapPayload): Promise<CareerRoadmapResult> {
    const response = await fetch("/api/career-roadmap", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse<CareerRoadmapResult>(response);
  }
}

export const apiService = new ApiService();
