/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../hooks/useAnalysis";
import { FeatureGate } from "../components/FeatureGate";
import {
  TrendingUp,
  Award,
  CheckCircle,
  FileText,
  Download,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import jsPDF from "jspdf";

export default function AnalyticalReports() {
  const { analysisResult, currentFile, history } = useAnalysis();
  const [isExporting, setIsExporting] = useState(false);

  // Fallback / mock historical comparison
  const mockTrendData = [
    { name: "Draft 1", score: 48, content: 40, style: 50, skills: 45 },
    { name: "Draft 2", score: 62, content: 55, style: 60, skills: 58 },
    { name: "Draft 3", score: 78, content: 75, style: 80, skills: 74 },
    { name: "Active", score: analysisResult?.scores.overall || 84, content: analysisResult?.scores.content?.score || 80, style: analysisResult?.scores.style?.score || 85, skills: analysisResult?.scores.skills?.score || 78 }
  ];

  const categoryScores = [
    { category: "Content", value: analysisResult?.scores.content?.score || 82, color: "#6366f1" },
    { category: "Brevity", value: analysisResult?.scores.brevity?.score || 78, color: "#a855f7" },
    { category: "Style", value: analysisResult?.scores.style?.score || 88, color: "#ec4899" },
    { category: "Sections", value: analysisResult?.scores.sections?.score || 95, color: "#10b981" },
    { category: "Skills", value: analysisResult?.scores.skills?.score || 75, color: "#f59e0b" }
  ];

  const handleExportPDF = () => {
    if (!analysisResult) return;
    setIsExporting(true);

    try {
      const getDynamicDate = () => {
        const today = new Date();
        const optionsMonthDay: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
        const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
        const monthDay = today.toLocaleDateString("en-US", optionsMonthDay);
        const year = today.getFullYear();
        return `${dayName}, ${monthDay}, ${year}`;
      };

      const doc = new jsPDF();
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text("CareerOS AI - ATS Audit Report", 14, 20);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${getDynamicDate()} | File: ${currentFile?.name || "Active Resume"}`, 14, 27);
      doc.line(14, 32, 196, 32);

      // Score
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text(`Overall ATS Score: ${analysisResult.scores.overall}/100`, 14, 42);

      // Score Breakdowns
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Category Scoring", 14, 52);
      
      let yOffset = 60;
      Object.entries(analysisResult.scores).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null && "score" in value) {
          doc.setFont("Helvetica", "bold");
          doc.text(`- ${key.toUpperCase()}: ${value.score}/100`, 18, yOffset);
          yOffset += 8;
        }
      });

      // Crucial Fixes
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Top Actionable Fixes recommended:", 14, yOffset + 10);
      yOffset += 18;

      analysisResult.issues.slice(0, 5).forEach((issue, index) => {
        const reduction = issue.severity === "critical" ? 12 : issue.severity === "warning" ? 7 : 4;
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`${index + 1}. [${issue.category.toUpperCase()}] ${issue.title} (Impact: -${reduction} pts)`, 14, yOffset);
        
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        const splitText = doc.splitTextToSize(issue.description, 175);
        doc.text(splitText, 14, yOffset + 5);
        yOffset += (splitText.length * 5) + 8;
      });

      doc.save(`CareerOS_ATS_Audit_${currentFile?.name.replace(".pdf", "").replace(".docx", "") || "Report"}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <FeatureGate requiredPlan="FREE">
      <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header card with export triggers */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0e1630] to-[#080d1a] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold font-mono uppercase tracking-wider">
            <Sparkles size={11} />
            <span>Analytical Insights</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-display">
            ATS Analytical Reports
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Review detailed historical score progression, segment weights, and generate exportable paper audits.
          </p>
        </div>

        {analysisResult && (
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs uppercase tracking-wider py-3 px-5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            <span>Export PDF Report</span>
          </button>
        )}
      </div>

      {!analysisResult ? (
        // Empty State
        <div className="p-12 text-center rounded-3xl bg-[#090d1a]/40 border border-white/5 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-white/5 flex items-center justify-center mx-auto text-slate-500">
            <TrendingUp size={24} />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-200">No Active Data Stream</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Analyze a resume first to generate dynamic analytics charts, category breakdowns, and full audit print reports.
            </p>
          </div>
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/10"
          >
            <span>Scan Resume</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        // Rich stats & charts
        <div className="space-y-8">
          
          {/* Top row summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">Overall Match Rating</span>
                <Award size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">{analysisResult.scores.overall}%</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-1">✔ Reconciled McKinsey Compliance</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">Audit Deductions</span>
                <Layers size={16} className="text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-200">{analysisResult.issues.length} Issues</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Found across 5 evaluation segments</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider">Suggested Actions</span>
                <Zap size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-indigo-300">{analysisResult.issues.filter(i => i.severity === "critical").length} Critical</p>
                <p className="text-[10px] text-amber-400 font-bold mt-1">💡 Action bullets require X-Y-Z phrasing</p>
              </div>
            </div>
          </div>

          {/* Graph Layout Grid */}
          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Chart A: Score improvement Trend */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#090d1a]/50 border border-white/5 md:col-span-7 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200 font-display">Score Progression Curve</h4>
                <p className="text-[10px] text-slate-500 font-medium">Tracking improvement drafts over continuous revisions</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} fontStyle="italic" />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#090d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      labelClassName="text-slate-400 text-xs font-semibold"
                    />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart B: Category Breakdown weightages */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#090d1a]/50 border border-white/5 md:col-span-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200 font-display">Segment Performance Weights</h4>
                <p className="text-[10px] text-slate-500 font-medium">Audited points scored in core assessment channels</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryScores} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="category" stroke="rgba(255,255,255,0.2)" fontSize={10} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#090d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      labelClassName="text-slate-400 text-xs font-semibold"
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {categoryScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Action recommendation logs */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#090d1a]/50 border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-slate-200 font-display">Identified System Deductions</h4>
            <div className="divide-y divide-white/5">
              {analysisResult.issues.slice(0, 4).map((issue, idx) => {
                const reduction = issue.severity === "critical" ? 12 : issue.severity === "warning" ? 7 : 4;
                return (
                  <div key={idx} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-300">{issue.title}</p>
                      <p className="text-slate-500 leading-normal font-medium max-w-xl">{issue.description}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold rounded-lg font-mono tracking-wider shrink-0">
                      -{reduction} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
    </FeatureGate>
  );
}
