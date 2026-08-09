/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useApp } from "../context/AppContext";
import { hasAccess, PlanLevel } from "../utils/featureAccess";
import { Lock, Crown, Zap, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export interface FeatureGateProps {
  requiredPlan: PlanLevel;
  children: React.ReactNode;
  currentPlan?: PlanLevel;
  lockedMessage?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  requiredPlan,
  children,
  currentPlan,
  lockedMessage,
}) => {
  const { plan: appPlan, setUpgradeModalOpen } = useApp();
  const effectivePlan = currentPlan || appPlan || "FREE";
  const navigate = useNavigate();

  const isUnlocked = hasAccess(effectivePlan, requiredPlan);

  if (isUnlocked) {
    return <>{children}</>;
  }

  const isPremiumRequired = requiredPlan === "PREMIUM";

  return (
    <div className="w-full h-full min-h-[70vh] flex items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full max-w-[500px] bg-[#090D1A] border border-white/10 rounded-[24px] p-8 text-center relative overflow-hidden shadow-2xl backdrop-blur-md"
      >
        {/* Soft background glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isPremiumRequired ? "bg-amber-400" : "bg-[#6E59FF]"
          }`}
        />

        {/* Crown / Lock Icon Badge */}
        <div
          className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center border relative z-10 ${
            isPremiumRequired
              ? "bg-amber-500/10 border-amber-500/30 text-[#F6C453]"
              : "bg-[#6E59FF]/10 border-[#6E59FF]/30 text-[#8B7CFF]"
          }`}
        >
          {isPremiumRequired ? <Crown size={32} /> : <Zap size={32} />}
        </div>

        {/* Plan Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-3 bg-white/5 border border-white/10">
          <Lock size={12} className="opacity-70" />
          <span className={isPremiumRequired ? "text-[#F6C453]" : "text-[#8B7CFF]"}>
            {requiredPlan} FEATURE
          </span>
        </div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold text-white mb-2 font-display">
          Unlock {isPremiumRequired ? "CareerOS Premium" : "CareerOS Pro"}
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto font-medium">
          {lockedMessage ||
            `This feature is exclusively available on the ${requiredPlan} plan. Upgrade your workspace to access advanced AI tools and accelerate your career.`}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg ${
              isPremiumRequired
                ? "bg-gradient-to-r from-[#F6C453] to-[#F2A93B] text-slate-950 hover:brightness-110"
                : "bg-gradient-to-r from-[#6E59FF] to-[#9D46FF] text-white hover:brightness-110"
            }`}
          >
            <span>Upgrade to {requiredPlan}</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate("/pricing")}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
          >
            View Plans
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FeatureGate;
