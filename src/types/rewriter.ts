/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ResumeSections {
  summary: string;
  education: string;
  projects: string;
  experience: string;
  skills: string;
  achievements: string;
  certifications: string;
  technicalSkills: string;
  softSkills: string;
  languages?: string;
  internships?: string;
  leadership?: string;
  awards?: string;
  publications?: string;
  interests?: string;
  customSections?: string;
}

export interface RewriteResult {
  improved: string;
  explanation: string;
  addedKeywords: string[];
  removedWords: string[];
  suggestedSkills: string[];
  missingSkills: string[];
  estimatedScoreAfter: number;
  userQuestion?: string;
}

export interface HistoryDraft {
  id: string;
  name: string;
  timestamp: string;
  sections: ResumeSections;
  improvedSections: Record<string, RewriteResult>;
  scores: {
    old: number;
    new: number;
  };
}

export interface DiffToken {
  type: "added" | "removed" | "normal";
  text: string;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: "idle" | "running" | "completed" | "failed";
}

export const SECTION_LABELS: Record<keyof ResumeSections, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  projects: "Projects",
  skills: "Skills & Core Competencies",
  technicalSkills: "Technical Skills",
  softSkills: "Soft Skills",
  education: "Education",
  achievements: "Key Achievements",
  certifications: "Certifications",
  languages: "Languages",
  internships: "Internships",
  leadership: "Leadership Experience",
  awards: "Awards & Honors",
  publications: "Publications",
  interests: "Interests & Hobbies",
  customSections: "Custom Sections"
};

export const DEFAULT_SECTIONS: ResumeSections = {
  summary: "Senior Software Engineer with 6+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud platforms.",
  experience: "Senior Software Engineer at TechFlow (2022 - Present)\n- Worked on the core dashboard, improving load times.\n- Helped migrate the backend databases to cloud infrastructure.\n- Managed a team of 4 junior developers and reviewed code.",
  projects: "CareerOS Workspace (2026)\n- Built an automated resume analyzer and scoring engine.\n- Integrated Gemini API to provide smart feedback.",
  skills: "React, Node.js, TypeScript, PostgreSQL, AWS, Docker, Git, REST APIs, GraphQL",
  technicalSkills: "JavaScript, TypeScript, Python, Go, React, Next.js, Express, PostgreSQL, Redis, AWS, Docker, CI/CD",
  softSkills: "Team Leadership, Mentoring, Agile Methodologies, Technical Writing, Communication",
  education: "Bachelor of Science in Computer Science, State University (2016 - 2020)",
  achievements: "- Won 1st place in National DevHackathon 2023.\n- Developed open-source library with 1,000+ GitHub stars.",
  certifications: "AWS Certified Solutions Architect, Professional Scrum Master",
  languages: "English (Fluent), Spanish (Conversational)",
  internships: "Software Engineer Intern at WebDev Co. (2019)\n- Assisted in building client websites using HTML/CSS/JavaScript.",
  leadership: "Lead Organizer, University Hackathon (2019)\n- Managed a team of 15 student volunteers and coordinated sponsors.",
  awards: "Outstanding Graduate in Computer Science (2020)",
  publications: "Co-authored paper on 'Scalable Web Architectures' in IEEE Journal (2020)",
  interests: "Open-source contributing, long-distance running, playing chess",
  customSections: ""
};

export const OPTIMIZATION_MODES = [
  { id: "ats", label: "ATS Optimization", desc: "Embeds search-keywords & standard metrics structures" },
  { id: "professional", label: "Professional Rewrite", desc: "Refines tone to high-level corporate parameters" },
  { id: "technical", label: "Technical Rewrite", desc: "Focuses on tech stack, libraries, and architecture details" },
  { id: "internship", label: "Internship Mode", desc: "Tailors descriptions specifically for students & grads" },
  { id: "executive", label: "Executive Mode", desc: "Emphasizes leadership, business scale, and financial impact" },
  { id: "recruiter", label: "Recruiter Friendly", desc: "Optimizes readability, styling structures, and clean formatting" },
  { id: "human", label: "Human Friendly", desc: "Keeps natural writing patterns without robotic keywords" },
  { id: "grammar", label: "Grammar Enhancement", desc: "Polishes syntax, corrects punctuation, and fixes errors" },
  { id: "action_verb", label: "Action Verb Enhancement", desc: "Swaps simple phrases with high-impact action verbs" },
  { id: "concise", label: "Concise", desc: "Trims filler language for higher information density" },
  { id: "detailed", label: "Detailed", desc: "Expands descriptions with rich scope, responsibility, and details" }
];
