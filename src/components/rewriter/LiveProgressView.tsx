/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Sparkles, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { ProgressStep } from "../../types/rewriter";

interface LiveProgressViewProps {
  steps: ProgressStep[];
  resumeName: string;
}

export default function LiveProgressView({ steps, resumeName }: LiveProgressViewProps) {
  const completedStepsCount = steps.filter(s => s.status === "completed").length;
  const progressPercent = Math.round((completedStepsCount / steps.length) * 100);

  const [activeFunPhrase, setActiveFunPhrase] = useState("Calibrating LLM semantic weights...");

  useEffect(() => {
    const phrases = [
      "Calibrating LLM semantic weights...",
      "Embedding active-voice corporate keywords...",
      "Injecting quantitative business metric structures...",
      "Resolving passive phrasing syntax issues...",
      "Auditing section compliance against 27 ATS benchmarks...",
      "Reformatting document grids for premium recruiter readability...",
      "Harmonizing visual tone parameters with selected modes..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % phrases.length;
      setActiveFunPhrase(phrases[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 bg-[#090D1A]/90 max-w-xl mx-auto space-y-6 text-center shadow-2xl animate-scaleIn">
      
      {/* Sparkle Header */}
      <div className="flex flex-col items-center space-y-2">
        <div className="p-3.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 animate-pulse">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Optimizing {resumeName.replace(/\.[^/.]+$/, "")}
        </h3>
        <p className="text-xs text-indigo-400 font-mono tracking-wide">
          {activeFunPhrase}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold font-mono text-slate-400">
          <span>STUDIO SEQUENCE PROGRESS</span>
          <span className="text-indigo-400">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="bg-slate-950/40 border border-white/5 p-4 rounded-2xl max-h-72 overflow-y-auto custom-scrollbar text-left space-y-2.5">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
              step.status === "running"
                ? "bg-indigo-500/10 border-indigo-500/20 text-white"
                : step.status === "completed"
                ? "bg-slate-900/30 border-white/5 text-slate-300"
                : "bg-transparent border-transparent text-slate-600"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {step.status === "running" ? (
                <RefreshCw size={12} className="animate-spin text-indigo-400" />
              ) : step.status === "completed" ? (
                <CheckCircle size={12} className="text-emerald-400" />
              ) : step.status === "failed" ? (
                <AlertCircle size={12} className="text-rose-400" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              )}
              <span className="text-xs font-semibold">{step.label}</span>
            </div>

            <span className="text-[9px] font-bold font-mono tracking-wider uppercase">
              {step.status === "running" && "Optimizing"}
              {step.status === "completed" && "Completed ✔"}
              {step.status === "failed" && "Failed 🗙"}
              {step.status === "idle" && "Idle"}
            </span>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-slate-500 font-mono text-center">
        CareerOS Engine: Utilizing Gemini AI with deep semantic alignment algorithms.
      </div>

    </div>
  );
}
