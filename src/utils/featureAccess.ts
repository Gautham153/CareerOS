/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlanLevel = "FREE" | "PRO" | "PREMIUM";

export const PLAN_HIERARCHY: Record<PlanLevel, number> = {
  FREE: 0,
  PRO: 1,
  PREMIUM: 2,
};

export interface FeatureConfig {
  id: string;
  name: string;
  requiredPlan: PlanLevel;
  path?: string;
}

export const FEATURES: Record<string, FeatureConfig> = {
  // FREE Features
  home: { id: "home", name: "Home", requiredPlan: "FREE", path: "/" },
  workspace: { id: "workspace", name: "Workspace", requiredPlan: "FREE", path: "/workspace" },
  analyzer: { id: "analyzer", name: "AI Resume Analyzer", requiredPlan: "FREE", path: "/analyzer" },
  dashboard: { id: "dashboard", name: "Dashboard Overview", requiredPlan: "FREE", path: "/dashboard" },
  pricing: { id: "pricing", name: "Pricing", requiredPlan: "FREE", path: "/pricing" },
  settings: { id: "settings", name: "Settings", requiredPlan: "FREE" },
  profile: { id: "profile", name: "Profile", requiredPlan: "FREE" },
  reports: { id: "reports", name: "Analytical Reports", requiredPlan: "FREE", path: "/reports" },

  // PRO Features
  rewriter: { id: "rewriter", name: "Resume Rewriter", requiredPlan: "PRO", path: "/rewriter" },
  improve: { id: "improve", name: "Bullet Optimizer", requiredPlan: "PRO", path: "/improve" },
  comparison: { id: "comparison", name: "Resume Comparison", requiredPlan: "PRO" },
  unlimitedAnalysis: { id: "unlimitedAnalysis", name: "Unlimited Resume Analysis", requiredPlan: "PRO" },
  history: { id: "history", name: "Saved Resume Library", requiredPlan: "PRO", path: "/history" },

  // PREMIUM Features
  jobMatch: { id: "jobMatch", name: "Job Search & Match", requiredPlan: "PREMIUM", path: "/job-match" },
  interviewCoach: { id: "interviewCoach", name: "Interview Coach", requiredPlan: "PREMIUM", path: "/interview-coach" },
  careerRoadmap: { id: "careerRoadmap", name: "Career Roadmap", requiredPlan: "PREMIUM" },
  careerMentor: { id: "careerMentor", name: "AI Career Mentor", requiredPlan: "PREMIUM" },
  coverLetter: { id: "coverLetter", name: "Cover Letter Generator", requiredPlan: "PREMIUM" },
  mockInterviews: { id: "mockInterviews", name: "AI Mock Interviews", requiredPlan: "PREMIUM" },
  portfolioAnalyzer: { id: "portfolioAnalyzer", name: "Portfolio Analyzer", requiredPlan: "PREMIUM" },
};

/**
 * Utility function to check if a user's plan meets the required plan
 */
export function hasAccess(userPlan: PlanLevel = "FREE", requiredPlan: PlanLevel = "FREE"): boolean {
  const userRank = PLAN_HIERARCHY[userPlan] ?? 0;
  const requiredRank = PLAN_HIERARCHY[requiredPlan] ?? 0;
  return userRank >= requiredRank;
}

/**
 * Check whether a specific feature ID is accessible for a plan
 */
export function isFeatureAccessible(featureId: string, userPlan: PlanLevel = "FREE"): boolean {
  const feat = FEATURES[featureId];
  if (!feat) return true;
  return hasAccess(userPlan, feat.requiredPlan);
}

/**
 * Retrieve the required plan for a path
 */
export function getRequiredPlanForPath(path: string): PlanLevel {
  const match = Object.values(FEATURES).find(
    (f) => f.path && (f.path === path || (path !== "/" && f.path !== "/" && path.startsWith(f.path)))
  );
  return match ? match.requiredPlan : "FREE";
}
