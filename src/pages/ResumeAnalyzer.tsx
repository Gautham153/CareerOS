/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFileParser } from "../hooks/useFileParser";
import { useAnalysis } from "../hooks/useAnalysis";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  Award,
  Zap,
  Trash2,
  RefreshCw,
  Terminal,
  Compass,
  FileSpreadsheet
} from "lucide-react";

export default function ResumeAnalyzer() {
  const { isDragActive, fileError, handleDragOver, handleDragLeave, handleDrop, handleFileSelect, resetParserState } = useFileParser();
  const { isAnalyzing, analysisResult, currentFile, clearAnalysis, errorDetails } = useAnalysis();
  
  const [showDebug, setShowDebug] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);
  const navigate = useNavigate();

  // Simulate upload progress for fine-tuned loading animations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setHasStartedAnalysis(true);
      setProgressVal(5);
      interval = setInterval(() => {
        setProgressVal((prev) => {
          if (prev >= 95) {
            return prev;
          }
          return prev + Math.floor(Math.random() * 12) + 3;
        });
      }, 400);
    } else {
      setProgressVal(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle routing directly to workspace when scan completes - disabled to let users choose the next step
  // useEffect(() => {
  //   if (hasStartedAnalysis && analysisResult && !isAnalyzing) {
  //     const timer = setTimeout(() => {
  //       navigate("/dashboard");
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [hasStartedAnalysis, analysisResult, isAnalyzing, navigate]);

  const handleRemoveResume = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    clearAnalysis();
    resetParserState();
    setHasStartedAnalysis(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn relative">
      
      {/* Visual Header card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/40 to-slate-900/60 border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-[10px] font-mono uppercase tracking-wider font-bold">
            <Sparkles size={11} className="animate-spin text-indigo-400" />
            <span>Interactive ATS Compliance Scans</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
            Resume Analyzer & Audit Suite
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Upload your resume document layers transiently. Our secure Google Gemini model audits formatting irregularities, syntax, structural completeness, and core McKinskey-standard metrics.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: upload card */}
        <div className="md:col-span-7">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative bg-[#090D1A]/60">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 rounded-3xl pointer-events-none" />
            
            {!currentFile ? (
              // Dropzone
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                  isDragActive 
                    ? "border-indigo-400 bg-indigo-500/5 scale-[1.01]" 
                    : "border-white/10 hover:border-indigo-500/30 bg-slate-950/20 hover:bg-slate-950/30"
                }`}
              >
                <div className="max-w-md mx-auto space-y-6">
                  <div className="mx-auto w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center animate-pulse border border-indigo-500/15">
                    <Upload size={28} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-200">Upload Your Resume</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
                      Drag and drop your PDF or Word (.docx) file here, or click to browse. Max 2MB.
                    </p>
                  </div>

                  <div>
                    <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(99,102,241,0.3)]">
                      <Compass size={14} />
                      <span>Choose File</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileSelect}
                        disabled={isAnalyzing}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              // Selected / Analyzing
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                    <FileText size={14} />
                    <span>Selected Document</span>
                  </div>
                  {isAnalyzing ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold animate-pulse">
                      <RefreshCw size={10} className="animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                      <CheckCircle size={10} />
                      Scanned Ready
                    </span>
                  )}
                </div>

                {/* File item card */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-200 truncate">{currentFile.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{formatBytes(currentFile.size)}</p>
                    </div>
                  </div>

                  {!isAnalyzing && (
                    <button
                      onClick={handleRemoveResume}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Remove Resume"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Progress details */}
                {isAnalyzing && (
                  <div className="space-y-3.5 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-indigo-300 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                        AI Evaluation Active
                      </span>
                      <span className="text-indigo-400 font-bold">{progressVal}%</span>
                    </div>
                    
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressVal}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {!isAnalyzing && analysisResult && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                      <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-left space-y-1">
                        <p className="font-bold text-xs text-emerald-400">Resume uploaded successfully.</p>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Ready for AI Analysis and Optimization.</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02] active:scale-98"
                      >
                        <TrendingUp size={14} className="text-indigo-400" />
                        <span>Analyze Resume</span>
                      </button>

                      <button
                        onClick={() => {
                          localStorage.setItem("resume_iq_auto_optimize_trigger", "true");
                          navigate("/rewriter", { state: { autoOptimize: true } });
                        }}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:scale-[1.02] active:scale-98 animate-pulse"
                      >
                        <span>✨ AI Optimize Resume</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex-1 cursor-pointer inline-flex items-center justify-center border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-[11px] py-2.5 rounded-xl transition-all text-center">
                        <span>Replace File</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <button
                        onClick={handleRemoveResume}
                        className="flex-1 cursor-pointer inline-flex items-center justify-center border border-rose-500/10 hover:border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 font-semibold text-[11px] py-2.5 rounded-xl transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {fileError && (
              <div className="space-y-4 text-left mt-6">
                <div className="text-xs sm:text-sm font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
                  <div className="space-y-1">
                    <p>Document Exception</p>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{fileError}</p>
                  </div>
                </div>

                {errorDetails && (
                  <div className="border border-white/8 rounded-2xl overflow-hidden bg-slate-950/40">
                    <button
                      type="button"
                      onClick={() => setShowDebug(!showDebug)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-1.5 font-mono">
                        <Terminal size={14} className="text-indigo-400" />
                        <span>Show Debug Stacktrace</span>
                      </div>
                    </button>
                    {showDebug && (
                      <pre className="p-4 bg-slate-950 text-[10px] font-mono text-slate-400 overflow-x-auto leading-relaxed border-t border-white/5">
                        {errorDetails}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: check details */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
            <h4 className="font-bold text-xs text-slate-200 uppercase tracking-widest font-mono">Included Checklist Audits</h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs leading-relaxed p-2 rounded-xl hover:bg-white/5 transition-colors">
                <Award size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-200">ATS Compliance Score</h5>
                  <p className="text-slate-500 mt-0.5 font-medium">Quantified action metrics resembling commercial Workday algorithms.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs leading-relaxed p-2 rounded-xl hover:bg-white/5 transition-colors">
                <Layers size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-200">Layout & Margin Integrity</h5>
                  <p className="text-slate-500 mt-0.5 font-medium">Catches nested table grids and formatting that block automated AI parsers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs leading-relaxed p-2 rounded-xl hover:bg-white/5 transition-colors">
                <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-slate-200">Skill Alignment Gap</h5>
                  <p className="text-slate-500 mt-0.5 font-medium">Pulls missing keywords required for target modern tech architectures.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3.5">
            <h5 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles size={13} />
              <span>Google X-Y-Z Integration</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              We process your resume against standard-setting frameworks: "Accomplished [X] as measured by [Y], by doing [Z]" to maximize impact density.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
