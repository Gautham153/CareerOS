/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ResumeSections, RewriteResult, DiffToken, SECTION_LABELS } from "../../types/rewriter";

export function computeDiff(oldStr: string, newStr: string): DiffToken[] {
  if (!oldStr) return [{ type: "added", text: newStr }];
  if (!newStr) return [{ type: "removed", text: oldStr }];

  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  
  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  
  while (i < oldWords.length || j < newWords.length) {
    if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
      tokens.push({ type: "normal", text: oldWords[i] });
      i++;
      j++;
    } else {
      let matched = false;
      for (let k = 1; k < 5; k++) {
        if (j + k < newWords.length && oldWords[i] === newWords[j + k]) {
          for (let m = 0; m < k; m++) {
            tokens.push({ type: "added", text: newWords[j + m] });
          }
          j += k;
          matched = true;
          break;
        }
        if (i + k < oldWords.length && oldWords[i + k] === newWords[j]) {
          for (let m = 0; m < k; m++) {
            tokens.push({ type: "removed", text: oldWords[i + m] });
          }
          i += k;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        if (i < oldWords.length && j < newWords.length) {
          tokens.push({ type: "removed", text: oldWords[i] });
          tokens.push({ type: "added", text: newWords[j] });
          i++;
          j++;
        } else if (i < oldWords.length) {
          tokens.push({ type: "removed", text: oldWords[i] });
          i++;
        } else if (j < newWords.length) {
          tokens.push({ type: "added", text: newWords[j] });
          j++;
        }
      }
    }
  }
  return tokens;
}

interface ResumeSheetProps {
  sections: ResumeSections;
  improvedSections: Record<string, RewriteResult>;
  mode: "original" | "optimized" | "comparison";
  showChanges: boolean;
  activeResumeName?: string;
}

export default function ResumeSheet({
  sections,
  improvedSections,
  mode,
  showChanges,
  activeResumeName = "CareerOS Candidate Workspace"
}: ResumeSheetProps) {
  
  const getSectionText = (key: keyof ResumeSections) => {
    const rawVal = sections[key] || "";
    const impVal = improvedSections[key]?.improved;

    if (mode === "original") {
      return rawVal;
    }
    if (mode === "optimized") {
      return impVal || rawVal;
    }
    // Comparison mode
    return impVal || rawVal;
  };

  const isSectionOptimized = (key: keyof ResumeSections) => {
    return !!improvedSections[key];
  };

  const renderSectionContent = (key: keyof ResumeSections) => {
    const text = getSectionText(key);
    if (!text || text.trim().length === 0) return null;

    if (mode === "comparison" && isSectionOptimized(key) && showChanges) {
      const origText = sections[key] || "";
      const impText = improvedSections[key]?.improved || "";
      const diffTokens = computeDiff(origText, impText);

      return (
        <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
          {diffTokens.map((token, idx) => {
            if (token.type === "added") {
              return (
                <span key={idx} className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 font-semibold px-0.5 rounded border border-emerald-500/20 mx-0.5">
                  {token.text}
                </span>
              );
            }
            if (token.type === "removed") {
              return (
                <span key={idx} className="bg-rose-500/20 text-rose-800 dark:text-rose-400 line-through px-0.5 rounded border border-rose-500/20 mx-0.5">
                  {token.text}
                </span>
              );
            }
            return <span key={idx}>{token.text}</span>;
          })}
        </div>
      );
    }

    return (
      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
        {text}
      </p>
    );
  };

  const candidateInitials = activeResumeName
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "IQ";

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden font-sans p-6 sm:p-8 space-y-6 max-h-[800px] overflow-y-auto custom-scrollbar">
      
      {/* Resume Document Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            {candidateInitials}
          </div>
          <div className="text-left">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              {activeResumeName.replace(/\.[^/.]+$/, "")}
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wide">
              CONFIDENTIAL | premium resume portfolio workspace
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider pt-1">
          <span>San Francisco, CA</span>
          <span>•</span>
          <span>workspace@resumeiq.ai</span>
          <span>•</span>
          <span>+1 (555) 019-9230</span>
        </div>
      </div>

      {/* Sections rendering like a real paper resume document */}
      <div className="space-y-5">
        {(Object.keys(SECTION_LABELS) as Array<keyof ResumeSections>).map(key => {
          const content = renderSectionContent(key);
          if (!content) return null;

          return (
            <div key={key} className="space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <h3 className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest font-mono">
                  {SECTION_LABELS[key]}
                </h3>
                {isSectionOptimized(key) && mode !== "original" && (
                  <span className="text-[8px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {mode === "comparison" && showChanges ? "Diff active" : "AI Optimized"}
                  </span>
                )}
              </div>
              <div className="pl-1">
                {content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
        <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
          generated by CareerOS optimization studio • PAGE 1 OF 1
        </p>
      </div>

    </div>
  );
}
