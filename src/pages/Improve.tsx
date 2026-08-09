/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAnalysis } from "../hooks/useAnalysis";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Flame,
  RefreshCcw,
  Copy,
  Check,
  Award,
  Zap,
  HelpCircle,
  Sparkle,
  BookOpen
} from "lucide-react";
import { ImprovedBulletResult } from "../services/api";
import { FeatureGate } from "../components/FeatureGate";

export default function Improve() {
  const [bulletText, setBulletText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [improvedResult, setImprovedResult] = useState<ImprovedBulletResult | null>(null);
  const [improveError, setImproveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { improveBullet, isImproving } = useAnalysis();

  // Mock templates for fast inspirations
  const inspirations = [
    {
      label: "Software Engineer",
      text: "Responsible for writing backend code and fixing bugs on the web portal."
    },
    {
      label: "DevOps Engineer",
      text: "Helped with container deployments and handled server configurations."
    },
    {
      label: "Project Manager",
      text: "Led the software project delivery and updated weekly scrum slides."
    }
  ];

  const handleImproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletText.trim()) return;

    setImproveError(null);
    setImprovedResult(null);

    try {
      const res = await improveBullet(bulletText, jobTitle, industry);
      setImprovedResult(res);
    } catch (err: any) {
      setImproveError(err.message || "Failed to process bullet optimization. Please try again.");
    }
  };

  const handleCopyToClipboard = () => {
    if (!improvedResult) return;
    navigator.clipboard.writeText(improvedResult.improved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadInspiration = (text: string) => {
    setBulletText(text);
  };

  return (
    <FeatureGate requiredPlan="PRO">
      <div className="min-h-screen bg-[#0B1020] text-slate-100 font-sans selection:bg-indigo-500/35">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        
        {/* Core Formula Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles size={12} className="animate-spin" /> 
            <span>Google Recruiter Approved</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            Accomplishment Optimizer
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            Weak phrases block callbacks. Translate passive descriptions into quantified results using Google's formula: <br />
            <span className="text-indigo-400 font-bold font-mono">"Accomplished [X], as measured by [Y], by doing [Z]"</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form & Presets */}
          <div className="lg:col-span-6 space-y-6">
            
            <form onSubmit={handleImproveSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                  Current Achievement Description
                </label>
                <textarea
                  className="w-full h-32 p-4 bg-slate-950/40 border border-white/8 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans leading-relaxed resize-none"
                  placeholder="e.g., Worked on the web portal redesign and improved overall user engagement."
                  value={bulletText}
                  onChange={(e) => setBulletText(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                    Target Role (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-950/40 border border-white/8 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
                    placeholder="e.g. Frontend Lead"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
                    Industry (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-slate-950/40 border border-white/8 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
                    placeholder="e.g. FinTech"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isImproving || !bulletText.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-900 text-white font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(99,102,241,0.25)]"
              >
                {isImproving ? (
                  <>
                    <RefreshCcw size={14} className="animate-spin" /> 
                    <span>Synthesizing Metrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> 
                    <span>Optimize Description</span>
                  </>
                )}
              </button>

              {improveError && (
                <div className="text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/15 p-3 rounded-xl flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>{improveError}</span>
                </div>
              )}
            </form>

            {/* Inspiration side presets */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                <BookOpen size={13} className="text-indigo-400" />
                <span>Weak Bullet Presets (Click to test)</span>
              </div>
              
              <div className="space-y-2.5">
                {inspirations.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => loadInspiration(preset.text)}
                    className="w-full text-left p-3.5 bg-slate-950/20 hover:bg-slate-950/50 border border-white/5 rounded-2xl transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-wide">
                        {preset.label}
                      </span>
                      <span className="text-[9px] font-bold text-slate-600 group-hover:text-indigo-300 transition-colors uppercase font-mono">
                        Insert
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1.5 truncate">
                      "{preset.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Results Section */}
          <div className="lg:col-span-6 relative">
            {isImproving ? (
              // Loading skeleton
              <div className="glass-panel p-8 sm:p-12 rounded-3xl space-y-6 text-center">
                <div className="relative inline-flex items-center justify-center w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl mb-2">
                  <RefreshCcw size={22} className="animate-spin text-indigo-500" />
                </div>
                
                <div className="space-y-2.5 max-w-sm mx-auto">
                  <h4 className="font-display font-extrabold text-sm text-slate-200">Revising Phrasing Gaps</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Analyzing semantic descriptors and interpolating mock numeric key indicators based on standard industry distributions.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <div className="h-3.5 bg-white/5 rounded w-full animate-pulse"></div>
                  <div className="h-3.5 bg-white/5 rounded w-5/6 animate-pulse"></div>
                  <div className="h-3.5 bg-white/5 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            ) : improvedResult ? (
              // Breathtaking Result View
              <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 animate-fadeIn">
                
                {/* Result header & impact meter */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    AI Rewritten Achievement
                  </span>
                  
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-xs text-emerald-400 font-bold font-mono">
                    <Flame size={12} className="animate-bounce" />
                    <span>Impact: {improvedResult.impactScoreBefore} → {improvedResult.impactScoreAfter}</span>
                  </div>
                </div>

                {/* Main Optimized Output */}
                <div className="p-5 rounded-2xl bg-[#0a0f1e]/80 border border-indigo-500/15 relative">
                  <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed pr-10">
                    "{improvedResult.improved}"
                  </p>
                  
                  <button
                    onClick={handleCopyToClipboard}
                    className={`absolute top-4 right-4 p-2 rounded-xl border transition-all cursor-pointer ${
                      copied 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : "bg-white/5 border-white/8 text-slate-400 hover:text-white"
                    }`}
                    title="Copy Achievement"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Formula Breakdown Breakdown Visual */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Impact Analysis & Phrasing Gaps Resolved
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {improvedResult.explanation}
                  </p>
                  
                  {/* Visual Timeline of XYZ formulation */}
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="flex gap-3 text-xs">
                      <span className="font-mono text-indigo-400 font-extrabold w-4 shrink-0">[X]</span>
                      <div className="text-slate-300">
                        <span className="text-indigo-300 font-semibold block">Accomplishment Metric</span>
                        Focuses cleanly on concrete results achieved rather than lists of daily tasks.
                      </div>
                    </div>
                    
                    <div className="flex gap-3 text-xs border-t border-white/5 pt-3">
                      <span className="font-mono text-purple-400 font-extrabold w-4 shrink-0">[Y]</span>
                      <div className="text-slate-300">
                        <span className="text-purple-300 font-semibold block">Measurement Metric</span>
                        Highlights percentages, cloud budget savings, or latency milliseconds.
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs border-t border-white/5 pt-3">
                      <span className="font-mono text-pink-400 font-extrabold w-4 shrink-0">[Z]</span>
                      <div className="text-slate-300">
                        <span className="text-pink-300 font-semibold block">Action/Methodology Metric</span>
                        Highlights tools utilized (e.g., PostgreSQL, Google Cloud, CI/CD).
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              // Empty State
              <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center text-slate-500 bg-slate-950/25">
                <Sparkle size={36} className="mx-auto mb-4 text-slate-600 animate-pulse" />
                <h4 className="font-display font-extrabold text-slate-300 text-sm">Awaiting Achievements</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mt-1.5">
                  Insert your weakest resume accomplishments on the left. We will generate metric-driven variations that fit ATS models.
                </p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
    </FeatureGate>
  );
}
