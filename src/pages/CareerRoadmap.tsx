/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FeatureGate } from "../components/FeatureGate";
import { useAnalysis } from "../hooks/useAnalysis";
import { apiService, CareerRoadmapResult } from "../services/api";
import {
  Compass,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  BookOpen,
  Briefcase,
  Award,
  Layers,
  FileText,
  Upload,
  ArrowRight,
  Download,
  Bookmark,
  Check,
  AlertCircle,
  Loader2,
  GraduationCap,
  Code,
  Target,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileCheck
} from "lucide-react";

const CAREER_GOALS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "Cybersecurity Engineer",
  "DevOps Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Other"
];

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const TIMELINE_OPTIONS = ["3 Months", "6 Months", "12 Months", "2 Years"];

const SAVED_ROADMAP_STORAGE_KEY = "careeros_saved_career_roadmap";

export default function CareerRoadmap() {
  const { currentFile, activeResumeText } = useAnalysis();

  // Form Inputs State
  const [careerGoal, setCareerGoal] = useState("Full Stack Developer");
  const [customGoal, setCustomGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [targetTimeline, setTargetTimeline] = useState("6 Months");
  const [resumeMode, setResumeMode] = useState<"latest" | "custom">(
    activeResumeText ? "latest" : "custom"
  );
  const [customResumeText, setCustomResumeText] = useState("");
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  // Roadmap Results State
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<CareerRoadmapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved roadmap on initial mount if available
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(SAVED_ROADMAP_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.roadmap) {
          setRoadmap(parsed.roadmap);
          if (parsed.savedAt) setSavedAt(parsed.savedAt);
        }
      }
    } catch {
      // Ignore local storage parse errors
    }
  }, []);

  const effectiveGoal = careerGoal === "Other" ? customGoal || "Technology Specialist" : careerGoal;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCustomResumeText(text || `Uploaded Resume: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const resumeToUse =
      resumeMode === "latest" ? activeResumeText || "" : customResumeText || "";

    setIsGenerating(true);

    try {
      const result = await apiService.generateCareerRoadmap({
        resumeText: resumeToUse,
        careerGoal: effectiveGoal,
        experienceLevel,
        targetTimeline
      });

      setRoadmap(result);

      // Auto scroll down to results section
      setTimeout(() => {
        const resultsEl = document.getElementById("roadmap-results-section");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || "Failed to generate career roadmap. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmap = () => {
    if (!roadmap) return;
    try {
      const timeStr = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      localStorage.setItem(
        SAVED_ROADMAP_STORAGE_KEY,
        JSON.stringify({ roadmap, savedAt: timeStr, goal: effectiveGoal })
      );
      setSavedAt(timeStr);
      showToast("Career Roadmap saved to local library!");
    } catch {
      showToast("Unable to save roadmap to local storage.");
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <FeatureGate requiredPlan="PREMIUM">
      <div className="min-h-screen bg-[#0B1020] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden print:bg-white print:text-black print:p-0">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 border border-emerald-400"
            >
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Header Card */}
          <div className="bg-[#111628] border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-xl relative overflow-hidden print:border-none print:p-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C5CFF]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>SaaS Premium Feature</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
                  Career Roadmap
                </h1>
                <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  Get an AI-generated learning path, skill gap analysis, and step-by-step milestone timeline to reach your dream career.
                </p>
              </div>

              {savedAt && (
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-slate-300 flex items-center gap-2 shrink-0">
                  <Bookmark size={16} className="text-amber-400" />
                  <div>
                    <div className="font-semibold text-white">Saved Roadmap Available</div>
                    <div className="text-[10px] text-slate-400">Last updated {savedAt}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONFIGURATION STEP FORM CARD */}
          <div className="bg-[#111628] border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-xl space-y-6 relative print:hidden">
            <h2 className="text-lg font-bold text-white tracking-tight font-display flex items-center gap-2">
              <Target size={20} className="text-[#7C5CFF]" />
              <span>Configure Your Career Trajectory</span>
            </h2>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              
              {/* STEP 1: Career Goal */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step 1: Career Goal
                </label>
                <select
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#7C5CFF] appearance-none cursor-pointer"
                >
                  {CAREER_GOALS.map((goal) => (
                    <option key={goal} value={goal} className="bg-[#090D1A] text-white">
                      {goal}
                    </option>
                  ))}
                </select>

                {careerGoal === "Other" && (
                  <input
                    type="text"
                    placeholder="e.g. Solutions Architect"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    className="w-full mt-2 bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFF]"
                  />
                )}
              </div>

              {/* STEP 2: Experience Level */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step 2: Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#7C5CFF] appearance-none cursor-pointer"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level} value={level} className="bg-[#090D1A] text-white">
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 3: Target Timeline */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step 3: Target Timeline
                </label>
                <select
                  value={targetTimeline}
                  onChange={(e) => setTargetTimeline(e.target.value)}
                  className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#7C5CFF] appearance-none cursor-pointer"
                >
                  {TIMELINE_OPTIONS.map((time) => (
                    <option key={time} value={time} className="bg-[#090D1A] text-white">
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP 4: Resume Source Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step 4: Resume
                </label>
                <div className="flex rounded-xl bg-[#090D1A] border border-white/10 p-1">
                  <button
                    type="button"
                    onClick={() => setResumeMode("latest")}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      resumeMode === "latest"
                        ? "bg-[#7C5CFF] text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileCheck size={13} />
                    <span>Latest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeMode("custom")}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      resumeMode === "custom"
                        ? "bg-[#7C5CFF] text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Upload size={13} />
                    <span>Upload/Text</span>
                  </button>
                </div>
              </div>

            </form>

            {/* Custom Resume Uploader Modal/Section if selected */}
            {resumeMode === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-[#090D1A] border border-white/10 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Paste Resume Content or Upload File
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#8B7CFF] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Upload size={12} />
                    <span>{customFileName ? customFileName : "Choose File..."}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste your resume text here to tailor your roadmap..."
                  value={customResumeText}
                  onChange={(e) => setCustomResumeText(e.target.value)}
                  className="w-full bg-[#111628] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#7C5CFF]"
                />
              </motion.div>
            )}

            {/* GENERATE ACTION BUTTON */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#7C5CFF] to-[#9D46FF] hover:brightness-110 active:scale-[0.99] transition-all shadow-xl shadow-[#7C5CFF]/25 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing Resume & Building Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate AI Roadmap</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ROADMAP OUTPUT SECTION */}
          {roadmap && (
            <div id="roadmap-results-section" className="space-y-8 animate-fadeIn">
              
              {/* TOP SUMMARY CARDS BAR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Readiness Score Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#111628] border border-white/10 rounded-[24px] p-6 shadow-xl relative overflow-hidden flex items-center gap-5"
                >
                  <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="text-white/10"
                        strokeWidth="7"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="text-[#7C5CFF]"
                        strokeWidth="7"
                        strokeDasharray={213}
                        strokeDashoffset={213 - (213 * roadmap.readinessScore) / 100}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-black text-lg text-white">
                      {roadmap.readinessScore}%
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Career Readiness Score
                    </h3>
                    <p className="text-lg font-extrabold text-white mt-0.5">
                      {roadmap.readinessScore >= 75
                        ? "High Career Match"
                        : roadmap.readinessScore >= 50
                        ? "Moderate Skill Fit"
                        : "Requires Skill Upgrading"}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Target Role: <strong className="text-slate-200">{effectiveGoal}</strong>
                    </span>
                  </div>
                </motion.div>

                {/* Skill Level Baseline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-[#111628] border border-white/10 rounded-[24px] p-6 shadow-xl flex items-center gap-4"
                >
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                    <UserCheck size={28} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Current Skill Baseline
                    </h3>
                    <p className="text-base font-extrabold text-white mt-1">
                      {roadmap.currentSkillLevel}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Level: <strong className="text-slate-200">{experienceLevel}</strong>
                    </span>
                  </div>
                </motion.div>

                {/* Target Duration Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-[#111628] border border-white/10 rounded-[24px] p-6 shadow-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                      <Clock size={28} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Estimated Horizon
                      </h3>
                      <p className="text-base font-extrabold text-white mt-1">
                        {roadmap.estimatedTime}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Target Timeline
                      </span>
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex flex-col gap-2 print:hidden">
                    <button
                      onClick={handleSaveRoadmap}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Save Roadmap"
                    >
                      <Bookmark size={16} />
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Export PDF"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </motion.div>

              </div>

              {/* MISSING SKILLS CHIPS */}
              {roadmap.missingSkills && roadmap.missingSkills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111628] border border-white/10 rounded-[24px] p-6 shadow-xl space-y-3"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>Identified Skill Gaps & Technical Requirements</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {roadmap.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
                      >
                        + {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MAIN CONTENT GRID: DESKTOP (LEFT: TIMELINE, RIGHT: RECOMMENDATIONS) / MOBILE (SINGLE COLUMN) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: VERTICAL TIMELINE LEARNING PATH */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-[#111628] border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h2 className="text-lg font-bold text-white tracking-tight font-display flex items-center gap-2">
                        <MapPin size={20} className="text-[#7C5CFF]" />
                        <span>Step-by-Step Learning Timeline</span>
                      </h2>
                      <span className="text-xs text-slate-400 font-medium">
                        {roadmap.learningPath.length} Structured Phases
                      </span>
                    </div>

                    {/* VERTICAL TIMELINE CONTAINER */}
                    <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#7C5CFF] before:via-[#9D46FF] before:to-emerald-500">
                      {roadmap.learningPath.map((phase, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className="relative pl-6 space-y-3 group"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-[#0B1020] border-2 border-[#7C5CFF] group-hover:border-emerald-400 group-hover:scale-110 transition-all flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-[#7C5CFF]/30">
                            {idx + 1}
                          </div>

                          {/* Phase Header */}
                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B7CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-2.5 py-0.5 rounded-full">
                              {phase.month}
                            </span>
                            {phase.milestone && (
                              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                <span>Milestone: {phase.milestone}</span>
                              </span>
                            )}
                          </div>

                          {/* Phase Title & Description */}
                          <div>
                            <h3 className="text-base font-extrabold text-white tracking-tight">
                              {phase.title}
                            </h3>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {phase.description}
                            </p>
                          </div>

                          {/* Tasks Checklist */}
                          {phase.tasks && phase.tasks.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Key Action Items
                              </span>
                              <ul className="space-y-1.5">
                                {phase.tasks.map((task, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-300">
                                    <div className="p-0.5 rounded-full bg-[#7C5CFF]/20 text-[#8B7CFF] shrink-0 mt-0.5">
                                      <Check size={10} className="stroke-[3]" />
                                    </div>
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: RECOMMENDED COURSES, PROJECTS, CERTIFICATIONS */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* RECOMMENDED COURSES */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-[#111628] border border-white/10 rounded-[28px] p-6 shadow-xl space-y-4"
                  >
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <BookOpen size={16} className="text-[#7C5CFF]" />
                      <span>Recommended Courses</span>
                    </h3>

                    <div className="space-y-3">
                      {roadmap.recommendedCourses?.map((course, idx) => (
                        <div
                          key={idx}
                          className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-extrabold text-white leading-snug">
                              {course.name}
                            </h4>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 shrink-0">
                              {course.difficulty}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-500" />
                              <span>{course.estimatedHours}</span>
                            </span>
                            {course.provider && (
                              <span className="text-slate-400 font-medium">{course.provider}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* RECOMMENDED PORTFOLIO PROJECTS */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-[#111628] border border-white/10 rounded-[28px] p-6 shadow-xl space-y-4"
                  >
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <Code size={16} className="text-emerald-400" />
                      <span>3 Flagship Portfolio Projects</span>
                    </h3>

                    <div className="space-y-3">
                      {roadmap.recommendedProjects?.map((project, idx) => (
                        <div
                          key={idx}
                          className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-extrabold text-white">
                              {idx + 1}. {project.name}
                            </h4>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                              {project.difficulty}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {project.techStack?.map((tech, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* CERTIFICATIONS & PORTFOLIO SUGGESTIONS */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-[#111628] border border-white/10 rounded-[28px] p-6 shadow-xl space-y-4"
                  >
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                      <Award size={16} className="text-amber-400" />
                      <span>Certifications & Portfolio Tips</span>
                    </h3>

                    {/* Certifications */}
                    {roadmap.certifications && roadmap.certifications.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Target Industry Certifications
                        </span>
                        <ul className="space-y-1">
                          {roadmap.certifications.map((cert, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              <span>{cert}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Portfolio Suggestions */}
                    {roadmap.portfolioSuggestions && roadmap.portfolioSuggestions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Recruiter Portfolio Checklist
                        </span>
                        <ul className="space-y-1.5">
                          {roadmap.portfolioSuggestions.map((tip, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interview Prep */}
                    {roadmap.interviewPreparation && roadmap.interviewPreparation.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Interview Prep Focus
                        </span>
                        <ul className="space-y-1.5">
                          {roadmap.interviewPreparation.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <ChevronRight size={13} className="text-[#7C5CFF] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>

                </div>

              </div>

              {/* BOTTOM EXPORT & SAVE ACTIONS BAR */}
              <div className="bg-[#111628] border border-white/10 rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    Ready to execute your career roadmap?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Export your learning timeline or save it to your CareerOS workspace.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleSaveRoadmap}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bookmark size={15} />
                    <span>Save Roadmap</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download size={15} />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </FeatureGate>
  );
}
