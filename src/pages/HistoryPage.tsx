/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAnalysis } from "../hooks/useAnalysis";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FeatureGate } from "../components/FeatureGate";
import {
  ArrowLeft,
  Trash2,
  Calendar,
  FileText,
  ChevronRight,
  Award,
  Search,
  Star,
  Edit2,
  Check,
  X,
  Filter,
  SlidersHorizontal,
  Trash,
  Plus,
  Sparkles,
  Download,
  Compass,
  TrendingUp
} from "lucide-react";

export default function HistoryPage() {
  const {
    history,
    currentFile,
    loadFromHistory,
    deleteHistoryItem,
    clearHistory,
    toggleFavoriteHistoryItem,
    renameHistoryItem
  } = useAnalysis();
  
  const navigate = useNavigate();

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all"); // all, high (85+), mid (70-84), low (<70)
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, score-desc, score-asc

  // Inline renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const handleLoadItem = (id: string) => {
    loadFromHistory(id);
    navigate("/dashboard");
  };

  const startRename = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(id);
    setTempName(name);
  };

  const saveRename = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (tempName.trim()) {
      renameHistoryItem(id, tempName.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  };

  const handleToggleFav = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteHistoryItem(id);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filter history items
  const filteredHistory = history
    .filter((item) => {
      const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isFav = !!item.isFavorite;
      const matchesFav = favoritesOnly ? isFav : true;
      
      let matchesScore = true;
      if (scoreFilter === "high") matchesScore = item.score >= 85;
      else if (scoreFilter === "mid") matchesScore = item.score >= 70 && item.score < 85;
      else if (scoreFilter === "low") matchesScore = item.score < 70;

      return matchesSearch && matchesFav && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === "score-desc") {
        return b.score - a.score;
      } else if (sortBy === "score-asc") {
        return a.score - b.score;
      }
      return 0;
    });

  return (
    <FeatureGate requiredPlan="PRO">
      <div className="min-h-screen bg-[#0B1020] text-slate-100 font-sans selection:bg-indigo-500/35 pb-20">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/8 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Scan Repository
            </h2>
            <p className="text-sm text-slate-400">
              Review and manage previously analyzed documents stored locally in your sandboxed filesystem.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/15 transition-all self-start sm:self-auto cursor-pointer"
            >
              Purge Scan History
            </button>
          )}
        </div>

        {/* Dashboard search, sort, and filters bar */}
        {history.length > 0 && (
          <div className="glass-panel rounded-2xl p-5 border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center shadow-lg">
            
            {/* Search Input (5 Columns) */}
            <div className="md:col-span-5 relative">
              <Search size={14} className="absolute left-4 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/8 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-slate-600"
              />
            </div>

            {/* Score Filters (3 Columns) */}
            <div className="md:col-span-3 flex items-center gap-2">
              <Filter size={13} className="text-slate-500 shrink-0" />
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-950/40 border border-white/8 rounded-xl text-xs font-bold text-slate-400 focus:outline-none focus:border-indigo-500/40 cursor-pointer"
              >
                <option value="all">All Score Ranges</option>
                <option value="high">Tier: High (85+)</option>
                <option value="mid">Tier: Average (70-84)</option>
                <option value="low">Tier: Weak (&lt;70)</option>
              </select>
            </div>

            {/* Sort Dropdown (2 Columns) */}
            <div className="md:col-span-2 flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2.5 bg-slate-950/40 border border-white/8 rounded-xl text-xs font-bold text-slate-400 focus:outline-none focus:border-indigo-500/40 cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="score-desc">Sort: Max Score</option>
                <option value="score-asc">Sort: Min Score</option>
              </select>
            </div>

            {/* Favorites Toggle Checkbox (2 Columns) */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  favoritesOnly
                    ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Star size={13} fill={favoritesOnly ? "currentColor" : "none"} />
                <span>Favorites</span>
              </button>
            </div>

          </div>
        )}

        {/* Saved Resumes Timeline Listing */}
        {history.length === 0 ? (
          // Case 1: Pure Empty State (no scans at all)
          <div className="border border-dashed border-white/10 rounded-3xl p-16 text-center text-slate-500 bg-slate-950/25">
            <FileText size={44} className="mx-auto mb-4 opacity-30 text-slate-400 animate-pulse" />
            <h4 className="font-display font-extrabold text-slate-300 text-base">No Saved Resumes Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
              Once you upload and run an audit on a PDF or Word resume, the scorecards will appear here for immediate reference.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all"
              >
                <Plus size={14} />
                <span>Upload Now</span>
              </Link>
            </div>
          </div>
        ) : filteredHistory.length === 0 ? (
          // Case 2: Filter Empty State (no search match)
          <div className="border border-dashed border-white/8 rounded-3xl p-16 text-center text-slate-500 bg-slate-950/20">
            <Search size={36} className="mx-auto mb-3 opacity-40" />
            <h4 className="font-bold text-slate-300 text-sm">No Results Match Filters</h4>
            <p className="text-xs text-slate-500 mt-1">
              Refine your keyword term, select 'All Score Ranges', or uncheck 'Favorites Only'.
            </p>
          </div>
        ) : (
          // Case 3: Display Grid
          <div className="space-y-6 relative pl-6 sm:pl-8 border-l border-white/5 ml-4">
            
            {filteredHistory.map((item, idx) => {
              const itemDate = new Date(item.timestamp);
              
              // Determine Score Badge Styling
              let scoreColor = "text-rose-400 bg-rose-500/10 border border-rose-500/15";
              if (item.score >= 85) {
                scoreColor = "text-emerald-400 bg-emerald-500/10 border border-emerald-500/15";
              } else if (item.score >= 70) {
                scoreColor = "text-amber-400 bg-amber-500/10 border border-amber-500/15";
              }

              const isRenaming = editingId === item.id;

              const downloadTextFile = (fileName: string, textContent: string) => {
                const element = document.createElement("a");
                const file = new Blob([textContent || ""], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = fileName.replace(/\.[^/.]+$/, "") + "_parsed.txt";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              };

              return (
                <div key={item.id} className="relative group animate-fadeIn">
                  
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[31px] sm:-left-[39px] top-6 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-indigo-500 ring-4 ring-indigo-500/10 z-10"></span>
                  
                  <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col gap-4 transition-all duration-300 hover:bg-slate-950/45 hover:border-white/12 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
                    
                    {/* Top Row: Info card split */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                      
                      {/* Left Column: Thumbnails & File meta */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        
                        {/* Realistic vertical Document Thumbnail */}
                        <div className="w-14 h-18 bg-slate-950/80 border border-white/10 rounded-xl p-2 shrink-0 flex flex-col justify-between shadow-[0_4px_10px_rgba(0,0,0,0.4)] relative">
                          {/* Little score bubble inside thumbnail */}
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[7px] font-mono font-bold text-white">
                            {item.score}
                          </div>
                          {/* Little lines representing paragraphs */}
                          <div className="space-y-1">
                            <div className="h-1 bg-white/15 rounded w-2/3"></div>
                            <div className="h-1 bg-white/10 rounded w-full"></div>
                            <div className="h-1 bg-white/10 rounded w-5/6"></div>
                          </div>
                          <div className="h-1 bg-white/15 rounded w-1/3"></div>
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          {isRenaming ? (
                            // Inline Renaming State
                            <div className="flex items-center gap-1.5 max-w-sm" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="px-2 py-1 bg-slate-900 border border-indigo-500/40 rounded-lg text-xs sm:text-sm text-slate-100 focus:outline-none w-full"
                                autoFocus
                              />
                              <button
                                onClick={(e) => saveRename(e, item.id)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                                title="Confirm Rename"
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={cancelRename}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            // Standard Name Display
                            <div className="flex flex-wrap items-center gap-2 min-w-0">
                              <h3 className="font-display font-bold text-slate-100 text-sm sm:text-base truncate">
                                {item.fileName}
                              </h3>
                              {currentFile?.name === item.fileName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold font-mono animate-pulse">
                                  Active Resume
                                </span>
                              )}
                              <button
                                onClick={(e) => startRename(e, item.id, item.fileName)}
                                className="p-1 text-slate-500 hover:text-indigo-400 rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                title="Rename File"
                              >
                                <Edit2 size={11} />
                              </button>
                            </div>
                          )}

                          {/* File Details Grid */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} /> {itemDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span>•</span>
                            <span>Size: {formatBytes(item.fileSize)}</span>
                          </div>

                          {/* Status Badges Row */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 text-[8px] font-bold font-mono">
                              Uploaded
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/15 text-purple-400 text-[8px] font-bold font-mono">
                              Parsed
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[8px] font-bold font-mono">
                              Analyzed
                            </span>
                            {localStorage.getItem("resume_iq_ai_optimized_" + item.fileName) === "true" && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/15 text-amber-400 text-[8px] font-bold font-mono shadow-[0_0_8px_rgba(245,158,11,0.15)] animate-pulse">
                                ✨ AI Optimized
                              </span>
                            )}
                            {localStorage.getItem("resume_iq_job_matched_" + item.fileName) === "true" && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/15 text-rose-400 text-[8px] font-bold font-mono">
                                💼 Job Matched
                              </span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Right Column: Score Badges */}
                      <div className="flex flex-col items-start sm:items-end shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${scoreColor}`}>
                          {item.score}/100 score
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          ATS audit
                        </span>
                      </div>

                    </div>

                    {/* Bottom Row: Comprehensive Professional Action Tray */}
                    <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* View Analysis */}
                        <button
                          onClick={() => {
                            loadFromHistory(item.id);
                            navigate("/dashboard");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <TrendingUp size={12} className="text-indigo-400" />
                          <span>View Analysis</span>
                        </button>

                        {/* AI Optimize Resume */}
                        <button
                          onClick={() => {
                            loadFromHistory(item.id);
                            localStorage.setItem("resume_iq_auto_optimize_trigger", "true");
                            navigate("/rewriter", { state: { autoOptimize: true } });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_2px_8px_rgba(99,102,241,0.1)]"
                        >
                          <Sparkles size={12} className="animate-pulse" />
                          <span>✨ AI Optimize</span>
                        </button>

                        {/* Job Match */}
                        <button
                          onClick={() => {
                            loadFromHistory(item.id);
                            navigate("/job-match");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/15 text-purple-300 hover:text-purple-200 text-[11px] font-bold transition-all cursor-pointer"
                        >
                          <Compass size={12} />
                          <span>Job Match</span>
                        </button>

                        {/* Download */}
                        <button
                          onClick={() => downloadTextFile(item.fileName, item.rawText)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/15 text-emerald-300 hover:text-emerald-200 text-[11px] font-bold transition-all cursor-pointer"
                          title="Download Parsed Document"
                        >
                          <Download size={12} />
                          <span>Download</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {/* Favorite Toggle */}
                        <button
                          onClick={(e) => handleToggleFav(e, item.id)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            item.isFavorite
                              ? "bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20"
                              : "bg-white/5 border-white/5 text-slate-500 hover:text-amber-400 hover:bg-white/10"
                          }`}
                          title={item.isFavorite ? "Unfavorite" : "Favorite"}
                        >
                          <Star size={13} fill={item.isFavorite ? "currentColor" : "none"} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteHistoryItem(item.id)}
                          className="p-2 bg-white/5 border border-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/15 rounded-xl transition-all cursor-pointer"
                          title="Delete Scan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </main>
    </div>
    </FeatureGate>
  );
}
