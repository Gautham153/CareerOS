/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, CheckSquare, Layers, HelpCircle } from "lucide-react";
import { ResumeSections, SECTION_LABELS } from "../../types/rewriter";

interface SectionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSections: Record<keyof ResumeSections, boolean>;
  setSelectedSections: React.Dispatch<React.SetStateAction<Record<keyof ResumeSections, boolean>>>;
  detectedKeys: Array<keyof ResumeSections>;
}

export default function SectionSelectorModal({
  isOpen,
  onClose,
  selectedSections,
  setSelectedSections,
  detectedKeys
}: SectionSelectorModalProps) {
  if (!isOpen) return null;

  const handleToggleSection = (key: keyof ResumeSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectAll = () => {
    const updated = { ...selectedSections };
    (Object.keys(updated) as Array<keyof ResumeSections>).forEach(k => {
      updated[k] = true;
    });
    setSelectedSections(updated);
  };

  const handleClearAll = () => {
    const updated = { ...selectedSections };
    (Object.keys(updated) as Array<keyof ResumeSections>).forEach(k => {
      updated[k] = false;
    });
    setSelectedSections(updated);
  };

  const handleSelectRecommended = () => {
    const updated = { ...selectedSections };
    (Object.keys(updated) as Array<keyof ResumeSections>).forEach(k => {
      updated[k] = ["summary", "projects", "experience", "skills"].includes(k);
    });
    setSelectedSections(updated);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full border border-white/10 relative shadow-2xl space-y-6 bg-[#090D1A]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
            <CheckSquare size={18} className="text-indigo-400" />
            <span>Select Sections to Optimize</span>
          </h3>
          <p className="text-xs text-slate-400">
            Only checked sections will be optimized by the AI. Unchecked sections will remain fully untouched.
          </p>
        </div>

        {/* Quick Buttons */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-white/5">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={handleSelectRecommended}
            className="px-3 py-1.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/25 text-indigo-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            ⚡ Recommended (Summary, Experience, Projects, Skills)
          </button>
        </div>

        {/* Checkboxes Grid */}
        <div className="grid sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
          {(Object.keys(SECTION_LABELS) as Array<keyof ResumeSections>).map((key) => {
            const isDetected = detectedKeys.includes(key);
            const isChecked = selectedSections[key];

            return (
              <button
                key={key}
                onClick={() => handleToggleSection(key)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isChecked
                    ? "bg-indigo-500/10 border-indigo-500/30 text-white"
                    : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all ${
                    isChecked
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "border-slate-600 bg-transparent"
                  }`}>
                    {isChecked && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold">{SECTION_LABELS[key]}</div>
                    <div className="text-[9px] text-slate-500">
                      {isDetected ? "Detected in Resume ✔" : "Optional / Manual Section"}
                    </div>
                  </div>
                </div>

                {isDetected && (
                  <span className="text-[8px] font-bold bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full">
                    Detected
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Apply Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
          >
            Save Selection
          </button>
        </div>

      </div>
    </div>
  );
}
