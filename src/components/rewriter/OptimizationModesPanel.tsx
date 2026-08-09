/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles } from "lucide-react";
import { OPTIMIZATION_MODES } from "../../types/rewriter";

interface OptimizationModesPanelProps {
  selectedModes: string[];
  setSelectedModes: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function OptimizationModesPanel({
  selectedModes,
  setSelectedModes
}: OptimizationModesPanelProps) {

  const handleToggleMode = (modeId: string) => {
    setSelectedModes(prev => {
      if (prev.includes(modeId)) {
        if (prev.length === 1) return prev; // Keep at least one mode
        return prev.filter(id => id !== modeId);
      } else {
        return [...prev, modeId];
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5">
        <Sparkles size={16} className="text-purple-400" />
        <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest font-mono">
          Choose Optimization Modes
        </h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {OPTIMIZATION_MODES.map((mode) => {
          const isSelected = selectedModes.includes(mode.id);

          return (
            <button
              key={mode.id}
              onClick={() => handleToggleMode(mode.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-purple-500/10 border-purple-500/35 text-white shadow-[0_2px_10px_rgba(168,85,247,0.1)]"
                  : "bg-slate-950/30 border-white/5 text-slate-400 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? "bg-purple-500 border-purple-500 text-white" : "border-slate-700 bg-transparent"
                }`}>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3.5} stroke="currentColor" className="w-2.5 h-2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-extrabold">{mode.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                {mode.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
