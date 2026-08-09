/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { 
  Crown, 
  Check, 
  Zap, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Star,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  isPopular: boolean;
  isPremium: boolean;
  badge?: string;
  glowColor?: string;
  accentColor?: string;
}

export default function Pricing() {
  const navigate = useNavigate();
  const { plan: currentPlan } = useApp();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastId, setToastId] = useState<number | null>(null);

  const getPlanButtonDetails = (planName: string) => {
    if (currentPlan === "FREE") {
      if (planName === "FREE") {
        return { text: "Current Plan", disabled: true, styleClass: "bg-slate-800 text-slate-400 cursor-default border border-white/5" };
      } else if (planName === "PRO") {
        return { text: "Upgrade", disabled: false, styleClass: "bg-[#7C5CFF] hover:bg-[#6A4BE0] text-white shadow-lg shadow-[#7C5CFF]/20 cursor-pointer" };
      } else {
        return { text: "Upgrade", disabled: false, styleClass: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white shadow-lg shadow-[#F59E0B]/10 cursor-pointer" };
      }
    } else if (currentPlan === "PRO") {
      if (planName === "FREE") {
        return { text: "Downgrade", disabled: true, styleClass: "bg-slate-800 text-slate-500 cursor-default border border-white/5 opacity-50" };
      } else if (planName === "PRO") {
        return { text: "Current Plan", disabled: true, styleClass: "bg-slate-800 text-slate-400 cursor-default border border-white/5" };
      } else {
        return { text: "Upgrade", disabled: false, styleClass: "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white shadow-lg shadow-[#F59E0B]/10 cursor-pointer" };
      }
    } else { // currentPlan === "PREMIUM"
      if (planName === "FREE") {
        return { text: "Downgrade", disabled: true, styleClass: "bg-slate-800 text-slate-500 cursor-default border border-white/5 opacity-50" };
      } else if (planName === "PRO") {
        return { text: "Downgrade", disabled: true, styleClass: "bg-slate-800 text-slate-500 cursor-default border border-white/5 opacity-50" };
      } else {
        return { text: "Current Plan", disabled: true, styleClass: "bg-slate-800 text-slate-400 cursor-default border border-white/5" };
      }
    }
  };

  const plans: PricingPlan[] = [
    {
      name: "FREE",
      price: "₹0",
      period: "/ month",
      description: "Essential tools to audit and kickstart your resume optimization.",
      buttonText: "Current Plan",
      isPopular: false,
      isPremium: false,
      features: [
        { text: "5 Resume Analyses", included: true },
        { text: "ATS Score", included: true },
        { text: "Resume Feedback", included: true },
        { text: "Save 3 Resumes", included: true },
        { text: "Dashboard", included: true }
      ]
    },
    {
      name: "PRO",
      price: "₹299",
      period: "/ month",
      description: "Advanced AI assistance to craft standard-setting applications.",
      buttonText: "Upgrade to Pro",
      isPopular: true,
      isPremium: false,
      badge: "MOST POPULAR",
      glowColor: "rgba(124, 92, 255, 0.15)",
      accentColor: "#7C5CFF",
      features: [
        { text: "Unlimited Resume Analysis", included: true },
        { text: "Resume Rewriter", included: true },
        { text: "Bullet Optimizer", included: true },
        { text: "Unlimited Reports", included: true },
        { text: "Unlimited Storage", included: true },
        { text: "Resume Comparison", included: true },
        { text: "Priority AI", included: true }
      ]
    },
    {
      name: "PREMIUM",
      price: "₹599",
      period: "/ month",
      description: "Elite coaching and personalized end-to-end career guidance.",
      buttonText: "Upgrade to Premium",
      isPopular: false,
      isPremium: true,
      glowColor: "rgba(245, 158, 11, 0.15)",
      accentColor: "#F59E0B",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Interview Coach", included: true },
        { text: "Career Mentor", included: true },
        { text: "Job Match", included: true },
        { text: "Career Roadmap", included: true },
        { text: "Cover Letter Generator", included: true },
        { text: "Skill Gap Analysis", included: true },
        { text: "Priority Support", included: true }
      ]
    }
  ];

  const comparisonRows = [
    { name: "Resume Analysis", free: "5 scans", pro: "Unlimited", premium: "Unlimited" },
    { name: "ATS Score & Feedback", free: "✓", pro: "✓", premium: "✓" },
    { name: "Resume Rewriter", free: "—", pro: "✓", premium: "✓" },
    { name: "Bullet Optimizer", free: "—", pro: "✓", premium: "✓" },
    { name: "Interview Coach", free: "—", pro: "—", premium: "✓" },
    { name: "Job Match", free: "—", pro: "—", premium: "✓" },
    { name: "Career Roadmap", free: "—", pro: "—", premium: "✓" },
    { name: "Reports", free: "Basic", pro: "Unlimited", premium: "Unlimited" },
    { name: "Storage", free: "3 Resumes", pro: "Unlimited", premium: "Unlimited" },
    { name: "Support", free: "Standard", pro: "Priority", premium: "24/7 Dedicated" }
  ];

  const faqs = [
    {
      question: "Can I cancel or change my plan at any time?",
      answer: "Yes, you can upgrade, downgrade, or cancel your subscription at any time. When you cancel, you will continue to have access to your paid features until the end of your billing period."
    },
    {
      question: "What is the Google X-Y-Z formula for bullet points?",
      answer: "Developed by Google recruiters, the X-Y-Z formula helps showcase your achievements clearly: 'Accomplished [X] as measured by [Y], by doing [Z]'. Our Bullet Optimizer is fully pre-trained on this syntax to maximize impact."
    },
    {
      question: "Is my personal data and resume text secure?",
      answer: "Absolutely. We encrypt all documents in transit and at rest. Your uploads are private to your account and are never sold or used to train third-party public language models."
    }
  ];

  const handlePlanClick = (planName: string) => {
    if (planName === "FREE") return;
    navigate(`/checkout?plan=${planName.toLowerCase()}`);
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#090B12] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Dynamic ambient grid overlay - matching background requirements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,92,255,0.05),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.03),transparent_50%)] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-16">
        
        {/* ==========================================
           ================== HEADER =================
           ========================================== */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#11131C] border border-white/5 text-xs text-[#7C5CFF] font-semibold tracking-wider uppercase"
          >
            <Crown size={12} />
            <span>Premium Career Acceleration</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
          >
            Choose Your CareerOS Plan
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-400 font-medium"
          >
            Upgrade whenever you're ready.
          </motion.p>
        </div>

        {/* ==========================================
           ================ THREE PLANS ==============
           ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch pt-6">
          {plans.map((plan, index) => {
            const isFree = plan.name === "FREE";
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  borderColor: plan.isPopular ? "#7C5CFF" : plan.isPremium ? "#F59E0B" : "rgba(255,255,255,0.15)",
                  boxShadow: plan.isPopular 
                    ? "0 20px 40px -15px rgba(124, 92, 255, 0.3)" 
                    : plan.isPremium 
                    ? "0 20px 40px -15px rgba(245, 158, 11, 0.2)" 
                    : "0 20px 40px -15px rgba(0,0,0,0.4)"
                }}
                className={`relative bg-[#11131C] border border-white/[0.06] rounded-[24px] p-8 flex flex-col justify-between transition-all duration-220 overflow-hidden ${
                  plan.isPopular ? "ring-2 ring-[#7C5CFF]/30" : ""
                }`}
                style={{
                  boxShadow: plan.isPopular 
                    ? `0 10px 30px -10px ${plan.glowColor}` 
                    : plan.isPremium 
                    ? `0 10px 30px -10px ${plan.glowColor}` 
                    : "none"
                }}
              >
                {/* Background glow overlay for special plans */}
                {(plan.isPopular || plan.isPremium) && (
                  <div 
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{
                      backgroundColor: plan.accentColor
                    }}
                  />
                )}

                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute top-5 right-5">
                    <span className="bg-[#7C5CFF] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Premium Badge / Indicator */}
                {plan.isPremium && (
                  <div className="absolute top-5 right-5 flex items-center gap-1 text-[#F59E0B]">
                    <Star size={14} className="fill-current" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">ELITE</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Price */}
                  <div>
                    <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400">
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1 text-white">
                      <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                      <span className="text-sm font-medium text-slate-400">{plan.period}</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/[0.06]" />

                  {/* Features List */}
                  <ul className="space-y-3.5">
                    {plan.features.map((feat) => (
                      <li key={feat.text} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <span className={`p-0.5 rounded-full shrink-0 ${
                          plan.isPopular 
                            ? "bg-[#7C5CFF]/15 text-[#7C5CFF]" 
                            : plan.isPremium 
                            ? "bg-[#F59E0B]/15 text-[#F59E0B]" 
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}>
                          <Check size={11} className="stroke-[3]" />
                        </span>
                        <span className="leading-normal">{feat.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button Action */}
                <div className="mt-8 pt-4">
                  {(() => {
                    const btn = getPlanButtonDetails(plan.name);
                    return (
                      <button
                        onClick={() => handlePlanClick(plan.name)}
                        disabled={btn.disabled}
                        className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 group ${btn.styleClass}`}
                      >
                        <span>{btn.text}</span>
                        {!btn.disabled && (
                          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        )}
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ==========================================
           ============= COMPARISON TABLE =============
           ========================================== */}
        <div className="pt-12 space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5 justify-center md:justify-start">
              <Sparkles size={18} className="text-[#7C5CFF]" />
              <span>Detailed Plan Comparison</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Check out all individual feature breakdowns across subscriptions.</p>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-white/[0.06] bg-[#11131C] shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                  <th className="p-5 text-xs font-bold tracking-wider uppercase text-slate-400">Features & Capabilities</th>
                  <th className="p-5 text-xs font-bold tracking-wider uppercase text-slate-400">Free</th>
                  <th className="p-5 text-xs font-[#7C5CFF] font-bold tracking-wider uppercase text-[#7C5CFF]">Pro</th>
                  <th className="p-5 text-xs font-[#F59E0B] font-bold tracking-wider uppercase text-[#F59E0B]">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {comparisonRows.map((row) => (
                  <tr key={row.name} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-xs font-semibold text-slate-200">{row.name}</td>
                    <td className="p-5 text-xs text-slate-400">{row.free}</td>
                    <td className="p-5 text-xs text-slate-200 font-medium">{row.pro}</td>
                    <td className="p-5 text-xs text-slate-200 font-medium">{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==========================================
           ================== FAQ ===================
           ========================================== */}
        <div className="pt-12 max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 justify-center">
              <HelpCircle size={18} className="text-[#7C5CFF]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Everything you need to know about the CareerOS billing.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = activeFAQ === i;
              return (
                <div 
                  key={i} 
                  className="rounded-2xl border border-white/[0.06] bg-[#11131C] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFAQ(i)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-slate-200 hover:bg-white/[0.01] transition-all"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-[#7C5CFF]" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-400" />
                    )}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-white/[0.02]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ==========================================
         ================= TOAST ==================
         ========================================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[#161925] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-3 max-w-sm"
          >
            <div className="p-2 bg-[#7C5CFF]/15 text-[#7C5CFF] rounded-xl">
              <Zap size={16} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Feature Notice</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
