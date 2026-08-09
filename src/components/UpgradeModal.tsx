/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { X, Check, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpgradeModal() {
  const { isUpgradeModalOpen, setUpgradeModalOpen, plan } = useApp();
  const navigate = useNavigate();

  // ESC key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUpgradeModalOpen(false);
      }
    };
    if (isUpgradeModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUpgradeModalOpen, setUpgradeModalOpen]);

  if (!isUpgradeModalOpen) return null;

  const isProUser = plan === "PRO";

  const proFeatures = [
    "Unlimited AI Resume Analysis",
    "AI Resume Rewriter (Section-by-Section)",
    "Bullet Point Optimizer (Google X-Y-Z Formula)",
    "ATS Resume Comparison Reports",
    "Saved Resume Library & Unlimited Storage",
    "Priority AI Processing Speed"
  ];

  const premiumFeatures = [
    "Job Search Engine & Custom Role Matcher",
    "AI Mock Interview Coach & Voice Scoring",
    "AI Career Roadmap & Skill Gap Analyzer",
    "Cover Letter Generator & Portfolio Reviewer",
    "24/7 Priority Career Support",
    "Everything included in CareerOS PRO"
  ];

  const currentFeatures = isProUser ? premiumFeatures : proFeatures;

  const handlePrimaryAction = () => {
    setUpgradeModalOpen(false);
    navigate(isProUser ? "/checkout?plan=premium" : "/checkout?plan=pro");
  };

  const handleViewPlans = () => {
    setUpgradeModalOpen(false);
    navigate("/pricing");
  };

  const handleClose = () => {
    setUpgradeModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="bg-[#090D1A] border border-white/10 rounded-[24px] w-full max-w-[520px] p-6 sm:p-8 relative z-10 shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Soft Glow */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 blur-3xl pointer-events-none rounded-full ${
                isProUser ? "bg-amber-500/20" : "bg-[#6E59FF]/15"
              }`}
            />

            {/* Top Right Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-6 relative z-10">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg border ${
                  isProUser
                    ? "bg-amber-500/15 border-amber-500/30 text-[#F6C453]"
                    : "bg-gradient-to-br from-[#6E59FF]/20 to-[#9D46FF]/20 border-[#6E59FF]/30 text-[#8B7CFF]"
                }`}
              >
                <Crown size={32} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight font-display mb-1.5">
                {isProUser ? "Upgrade to CareerOS Premium" : "Unlock CareerOS Pro"}
              </h2>
              <p className="text-xs text-slate-400 font-medium max-w-sm">
                {isProUser
                  ? "Unlock job search matching, mock interviews, and career roadmaps."
                  : "Upgrade your workspace and accelerate your career."}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-2.5 mb-7 bg-white/[0.02] border border-white/5 rounded-2xl p-4 relative z-10">
              {currentFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isProUser
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                        : "bg-[#6E59FF]/15 border-[#6E59FF]/30 text-[#8B7CFF]"
                    }`}
                  >
                    <Check size={12} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 relative z-10">
              <button
                onClick={handlePrimaryAction}
                className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg text-center ${
                  isProUser
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/20"
                    : "bg-gradient-to-r from-[#6E59FF] to-[#9D46FF] text-white hover:brightness-110 shadow-[#6E59FF]/25"
                }`}
              >
                {isProUser ? "Upgrade to Premium (₹599)" : "Upgrade to Pro (₹299)"}
              </button>
              <button
                onClick={handleViewPlans}
                className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer text-center"
              >
                View Plans
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-medium relative z-10">
              <span>Current Plan</span>
              <span className="font-extrabold text-slate-300 uppercase tracking-wider bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                {plan || "FREE"}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
