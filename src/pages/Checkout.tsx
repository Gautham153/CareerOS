/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { paymentService } from "../services/paymentService";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Crown,
  Zap,
  ArrowRight,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
  Building2,
  Globe,
  HelpCircle
} from "lucide-react";

type PlanType = "PRO" | "PREMIUM";

interface PlanConfig {
  id: PlanType;
  title: string;
  name: string;
  price: string;
  amount: number;
  period: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  features: string[];
}

const PLAN_DETAILS: Record<PlanType, PlanConfig> = {
  PRO: {
    id: "PRO",
    title: "CareerOS PRO",
    name: "Pro Plan",
    price: "₹299",
    amount: 299,
    period: "/ month",
    badge: "MOST POPULAR",
    badgeColor: "bg-[#7C5CFF]/20 text-[#8B7CFF] border-[#7C5CFF]/30",
    accentColor: "#7C5CFF",
    features: [
      "Unlimited Resume Analysis & ATS Audits",
      "AI Resume Rewriter (Section-by-Section)",
      "Bullet Point Optimizer (Google X-Y-Z Syntax)",
      "Unlimited Comparison Reports & PDF Exports",
      "Saved Resume Library & Unlimited Storage",
      "Priority AI Response & Fast Processing"
    ]
  },
  PREMIUM: {
    id: "PREMIUM",
    title: "CareerOS PREMIUM",
    name: "Premium Plan",
    price: "₹599",
    amount: 599,
    period: "/ month",
    badge: "ELITE SUITE",
    badgeColor: "bg-amber-500/20 text-[#F6C453] border-amber-500/30",
    accentColor: "#F59E0B",
    features: [
      "Everything in CareerOS PRO",
      "AI Mock Interview Coach & Speech Scoring",
      "AI Career Roadmap & Skill Gap Analyzer",
      "Job Match Engine & Target Customization",
      "Cover Letter Generator & Portfolio Reviewer",
      "24/7 Dedicated Priority Mentorship Support"
    ]
  }
};

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Singapore",
  "United Arab Emirates",
  "France",
  "Japan"
];

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { upgradeToPlan, plan: currentActivePlan } = useApp();

  // Detect plan from query string
  const paramPlan = searchParams.get("plan")?.toUpperCase();
  const initialPlan: PlanType = paramPlan === "PREMIUM" ? "PREMIUM" : "PRO";

  const [selectedPlan, setSelectedPlan] = useState<PlanType>(initialPlan);
  
  // Form Fields State (Stored strictly in memory, never persisted)
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [country, setCountry] = useState("India");
  const [zipCode, setZipCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & Validation States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const planInfo = PLAN_DETAILS[selectedPlan];

  // Auto-format card number as spaces every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    if (fieldErrors.cardNumber) {
      setFieldErrors(prev => ({ ...prev, cardNumber: "" }));
    }
  };

  // Auto-format expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
    if (fieldErrors.expiry) {
      setFieldErrors(prev => ({ ...prev, expiry: "" }));
    }
  };

  // Format CVV max 3 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(raw);
    if (fieldErrors.cvv) {
      setFieldErrors(prev => ({ ...prev, cvv: "" }));
    }
  };

  // Perform validation checks
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanCard = cardNumber.replace(/\s+/g, "");

    if (!cardholderName.trim()) {
      errors.cardholderName = "Cardholder name is required";
    }
    if (!cleanCard || cleanCard.length !== 16 || !/^\d+$/.test(cleanCard)) {
      errors.cardNumber = "Card number must be exactly 16 digits";
    }
    if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      errors.expiry = "Expiry must be in MM/YY format";
    }
    if (!cvv || !/^\d{3}$/.test(cvv)) {
      errors.cvv = "CVV must be 3 digits";
    }
    if (!zipCode.trim()) {
      errors.zipCode = "ZIP / Postal Code is required";
    }
    if (!agreeTerms) {
      errors.agreeTerms = "You must agree to the Terms of Service to proceed";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage("Please resolve the highlighted validation issues before proceeding.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await paymentService.processPayment({
        plan: selectedPlan,
        price: `${planInfo.price}${planInfo.period}`,
        paymentDetails: {
          cardholderName,
          cardNumber,
          expiry,
          cvv,
          country,
          zipCode,
          agreeToTerms: agreeTerms
        }
      });

      if (result.success) {
        // Update Firestore & local AppContext plan state
        await upgradeToPlan(selectedPlan);

        setTransactionId(result.transactionId || "TX_" + Date.now());
        setIsSuccess(true);
      } else {
        setErrorMessage(result.error || "Payment processing failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during payment processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C5CFF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <button
            onClick={() => navigate("/pricing")}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Pricing</span>
          </button>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <ShieldCheck size={13} />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Lock size={12} className="opacity-70" />
              <span>In-Memory Safe Checkout</span>
            </span>
          </div>
        </div>

        {/* SUCCESS VIEW */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-2xl mx-auto bg-[#111628] border border-white/10 rounded-[32px] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

              {/* Glowing Success Badge */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/10">
                <CheckCircle2 size={44} className="stroke-[2.5]" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider mb-4">
                <Sparkles size={12} />
                <span>Subscription Active</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-2">
                Subscription Activated Successfully!
              </h1>
              
              <p className="text-sm text-slate-300 font-medium max-w-md mx-auto mb-8 leading-relaxed">
                Welcome to <span className="text-white font-bold">{planInfo.title}</span>! All premium AI tools and workspace features have been unlocked for your account.
              </p>

              {/* Transaction Summary Card */}
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-8 text-left space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Selected Plan</span>
                  <span className="font-bold text-white">{planInfo.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Amount Charged</span>
                  <span className="font-bold text-white">{planInfo.price}{planInfo.period}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Transaction Reference</span>
                  <span className="font-mono text-[11px] text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {transactionId}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-white/5">
                  <span>Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check size={12} /> Active
                  </span>
                </div>
              </div>

              {/* Next Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => navigate("/workspace")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                >
                  Continue to Workspace
                </button>
              </div>
            </motion.div>
          ) : (
            /* CHECKOUT FORM & SUMMARY CONTAINER */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: ORDER SUMMARY */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#111628] border border-white/10 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                  
                  {/* Subtle top ambient glow */}
                  <div
                    className="absolute top-0 right-0 w-48 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
                    style={{ backgroundColor: planInfo.accentColor }}
                  />

                  {/* Order Summary Title */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight font-display">
                        Order Summary
                      </h2>
                      <p className="text-xs text-slate-400">Selected SaaS tier details</p>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${planInfo.badgeColor}`}>
                      {planInfo.badge}
                    </span>
                  </div>

                  {/* Plan Switcher Toggle */}
                  <div className="bg-white/5 p-1 rounded-xl flex items-center border border-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("PRO")}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPlan === "PRO"
                          ? "bg-[#7C5CFF] text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      PRO (₹299/mo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("PREMIUM")}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedPlan === "PREMIUM"
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      PREMIUM (₹599/mo)
                    </button>
                  </div>

                  {/* Main Plan Title & Price Display */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xl font-extrabold text-white tracking-tight">
                        {planInfo.title}
                      </h3>
                      <div className="text-right">
                        <span className="text-2xl font-black text-white">{planInfo.price}</span>
                        <span className="text-xs text-slate-400">{planInfo.period}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Instant access to all {selectedPlan.toLowerCase()} suite capabilities. Auto-renews monthly, cancel anytime in Settings.
                    </p>
                  </div>

                  {/* Included Features Checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Included in {planInfo.name}
                    </h4>
                    <ul className="space-y-2.5">
                      {planInfo.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Calculation Breakdown */}
                  <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>{planInfo.price}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Taxes & GST</span>
                      <span className="text-emerald-400 font-semibold">Included</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/5">
                      <span>Total Due Today</span>
                      <span className="text-emerald-400">{planInfo.price}</span>
                    </div>
                  </div>

                  {/* Trust Footer */}
                  <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5 flex items-center gap-3 text-[11px] text-slate-400">
                    <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                    <span>30-Day satisfaction guarantee. Cancel or switch plans directly from your account settings at any time.</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: PAYMENT FORM */}
              <div className="lg:col-span-7">
                <div className="bg-[#111628] border border-white/10 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xl relative">
                  
                  {/* Form Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-tight font-display flex items-center gap-2">
                        <CreditCard size={18} className="text-[#7C5CFF]" />
                        <span>Payment Method</span>
                      </h2>
                      <p className="text-xs text-slate-400">Enter your card details to activate subscription</p>
                    </div>

                    {/* Card Brand Logos */}
                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="text-[10px] font-black tracking-widest text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/10">VISA</span>
                      <span className="text-[10px] font-black tracking-widest text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/10">MC</span>
                      <span className="text-[10px] font-black tracking-widest text-slate-300 bg-white/5 px-2 py-1 rounded border border-white/10">AMEX</span>
                    </div>
                  </div>

                  {/* Global Error Banner */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5"
                    >
                      <AlertCircle size={16} className="shrink-0 text-rose-400" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Cardholder Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alex Morgan"
                        value={cardholderName}
                        onChange={(e) => {
                          setCardholderName(e.target.value);
                          if (fieldErrors.cardholderName) setFieldErrors(prev => ({ ...prev, cardholderName: "" }));
                        }}
                        disabled={isProcessing}
                        className={`w-full bg-[#090D1A] border rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/50 transition-all ${
                          fieldErrors.cardholderName ? "border-rose-500" : "border-white/10 focus:border-[#7C5CFF]"
                        }`}
                      />
                      {fieldErrors.cardholderName && (
                        <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.cardholderName}</p>
                      )}
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Card Number <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          disabled={isProcessing}
                          className={`w-full bg-[#090D1A] border rounded-xl pl-4 pr-10 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/50 transition-all ${
                            fieldErrors.cardNumber ? "border-rose-500" : "border-white/10 focus:border-[#7C5CFF]"
                          }`}
                        />
                        <CreditCard size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      </div>
                      {fieldErrors.cardNumber && (
                        <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.cardNumber}</p>
                      )}
                    </div>

                    {/* Expiry & CVV Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Expiry */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Expiry Date <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          disabled={isProcessing}
                          className={`w-full bg-[#090D1A] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/50 transition-all ${
                            fieldErrors.expiry ? "border-rose-500" : "border-white/10 focus:border-[#7C5CFF]"
                          }`}
                        />
                        {fieldErrors.expiry && (
                          <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.expiry}</p>
                        )}
                      </div>

                      {/* CVV */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                          <span>CVV <span className="text-rose-400">*</span></span>
                          <span className="text-[10px] text-slate-500 font-normal">3 digits</span>
                        </label>
                        <input
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={handleCvvChange}
                          disabled={isProcessing}
                          className={`w-full bg-[#090D1A] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/50 transition-all ${
                            fieldErrors.cvv ? "border-rose-500" : "border-white/10 focus:border-[#7C5CFF]"
                          }`}
                        />
                        {fieldErrors.cvv && (
                          <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.cvv}</p>
                        )}
                      </div>
                    </div>

                    {/* Country & ZIP Code Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Country */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Country
                        </label>
                        <div className="relative">
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            disabled={isProcessing}
                            className="w-full bg-[#090D1A] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#7C5CFF] appearance-none cursor-pointer"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c} className="bg-[#090D1A] text-white">
                                {c}
                              </option>
                            ))}
                          </select>
                          <Globe size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                      </div>

                      {/* ZIP Code */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          ZIP / Postal Code <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="110001"
                          value={zipCode}
                          onChange={(e) => {
                            setZipCode(e.target.value);
                            if (fieldErrors.zipCode) setFieldErrors(prev => ({ ...prev, zipCode: "" }));
                          }}
                          disabled={isProcessing}
                          className={`w-full bg-[#090D1A] border rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/50 transition-all ${
                            fieldErrors.zipCode ? "border-rose-500" : "border-white/10 focus:border-[#7C5CFF]"
                          }`}
                        />
                        {fieldErrors.zipCode && (
                          <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.zipCode}</p>
                        )}
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (fieldErrors.agreeTerms) setFieldErrors(prev => ({ ...prev, agreeTerms: "" }));
                          }}
                          disabled={isProcessing}
                          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[#090D1A] text-[#7C5CFF] focus:ring-[#7C5CFF]/50 cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 leading-relaxed">
                          I agree to the <span className="text-slate-200 underline">Terms of Service</span>, <span className="text-slate-200 underline">Privacy Policy</span>, and recurring monthly authorization.
                        </span>
                      </label>
                      {fieldErrors.agreeTerms && (
                        <p className="text-[11px] text-rose-400 mt-1 ml-6">{fieldErrors.agreeTerms}</p>
                      )}
                    </div>

                    {/* Submit Pay Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xl cursor-pointer ${
                          selectedPlan === "PREMIUM"
                            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/20"
                            : "bg-gradient-to-r from-[#7C5CFF] to-[#9D46FF] text-white hover:brightness-110 shadow-[#7C5CFF]/25"
                        } ${isProcessing ? "opacity-80 cursor-wait" : "active:scale-[0.99]"}`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Processing Payment...</span>
                          </>
                        ) : (
                          <>
                            <Lock size={14} />
                            <span>Upgrade to {selectedPlan === "PREMIUM" ? "Premium" : "Pro"} ({planInfo.price})</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Security Notice */}
                    <div className="text-center pt-2">
                      <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        <span>Card info is validated in-memory and never saved to databases.</span>
                      </p>
                    </div>

                  </form>
                </div>
              </div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
