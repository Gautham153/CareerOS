/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Briefcase,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Star,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Play,
  Github,
  Linkedin
} from "lucide-react";
import { CareerOSLogo } from "../components/CareerOSLogo";

export default function Landing() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      title: "AI Resume Analysis",
      description: "Instantly scan and audit your entire resume text layers against modern recruiter parameters and semantic checks.",
      icon: FileText,
      badge: "Popular",
      color: "text-[#7C5CFF] bg-[#7C5CFF]/10",
      status: "Active"
    },
    {
      title: "ATS Compatibility",
      description: "Verify that your headings, dividers, and bullet outlines comply with major Enterprise Applicant Tracking Systems (ATS).",
      icon: Layers,
      badge: null,
      color: "text-[#A855F7] bg-[#A855F7]/10",
      status: "Active"
    },
    {
      title: "Job Match Engine",
      description: "Directly copy-paste your target job description and compare role-specific skill density and alignment scores.",
      icon: Briefcase,
      badge: "Core",
      color: "text-[#3B82F6] bg-[#3B82F6]/10",
      status: "Active"
    },
    {
      title: "Bullet Optimizer",
      description: "Rephrase passive bullets instantly using Google's X-Y-Z framework (Accomplished X, measured by Y, by doing Z).",
      icon: Zap,
      badge: null,
      color: "text-[#F59E0B] bg-[#F59E0B]/10",
      status: "Active"
    },
    {
      title: "Resume Rewriter",
      description: "Automatically refine sentences into customized active corporate voice parameters using premium AI models.",
      icon: Award,
      badge: null,
      color: "text-[#10B981] bg-[#10B981]/10",
      status: "Active"
    },
    {
      title: "AI Interview Coach",
      description: "Simulate simulated HR round questions and answers directly aligned with your custom candidate profile.",
      icon: Sparkles,
      badge: "Coming Soon",
      color: "text-brand-text-muted bg-brand-border",
      status: "Upcoming"
    },
    {
      title: "Career Roadmap",
      description: "Receive high-level, structured timelines to unlock technical masteries and transition paths inside corporate levels.",
      icon: TrendingUp,
      badge: "Coming Soon",
      color: "text-brand-text-muted bg-brand-border",
      status: "Upcoming"
    },
    {
      title: "Cover Letter Generator",
      description: "Instantly compile responsive, tailormade cover letters matching your resume score and target job descriptions.",
      icon: Sparkles,
      badge: "Coming Soon",
      color: "text-brand-text-muted bg-brand-border",
      status: "Upcoming"
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Resume",
      desc: "Drag and drop your PDF or Word resume draft securely into our premium parsing engine."
    },
    {
      num: "02",
      title: "AI Extracts Content",
      desc: "Our model breaks down and parses individual section headings, formatting tables, and skill layouts."
    },
    {
      num: "03",
      title: "AI Scores Resume",
      desc: "Your document is evaluated against 27 proprietary ATS criteria and corporate compliance logs."
    },
    {
      num: "04",
      title: "Personalized Improvements",
      desc: "Receive actionable bullet edits, metric formulas, and direct terminology substitutions."
    },
    {
      num: "05",
      title: "Land More Interviews",
      desc: "Download your clean corporate resume and unlock confidence throughout the HR screening pipeline."
    }
  ];

  const stats = [
    { value: "50K+", label: "Resumes Reviewed", sub: "Global candidates" },
    { value: "95%", label: "ATS Accuracy Rate", sub: "Enterprise test suites" },
    { value: "90%", label: "Score Improvement", sub: "Within 2 revisions" },
    { value: "4.9★", label: "Average Rating", sub: "User satisfaction logs" }
  ];

  const testimonials = [
    {
      quote: "Using the Google X-Y-Z formula rebuilder, I converted my passive engineering bullets into quantitative metrics. I landed initial interviews with Meta and Stripe in just two weeks!",
      author: "Alex Rivera",
      role: "Staff Frontend Engineer",
      avatar: "AR"
    },
    {
      quote: "The Job Match engine is extremely accurate. It pointed out three missing cloud technologies from my profile that were critical in the job posting. Invaluable!",
      author: "Sarah Jenkins",
      role: "Cloud Architect",
      avatar: "SJ"
    },
    {
      quote: "Excellent SaaS! The clean single-view format has completely removed formatting soup and layout compliance issues. Our recruits are seeing tremendous success rates.",
      author: "David Vance",
      role: "Technical Recruiter, TechRecruits",
      avatar: "DV"
    }
  ];

  const faqs = [
    {
      q: "How does the ATS Scoring model evaluate my resume?",
      a: "We evaluate your resume across 5 major assessment channels: Content Relevance, formatting constraints, brevity (length/formatting), structural dividers, and skill densities. These match exact standards utilized by top enterprise hiring software."
    },
    {
      q: "Is my personal data secure inside CareerOS.AI?",
      a: "Yes, absolutely. All file uploads are parsed server-side using secure API protocols. Your files and data are only stored inside your client local workspace context, preserving complete confidentiality."
    },
    {
      q: "What is Google's X-Y-Z resume formula?",
      a: "Coined by Google's HR department, it suggests phrasing accomplishments as: 'Accomplished [X] as measured by [Y], by doing [Z]'. This ensures your resume acts as a robust metric log rather than a flat duty description."
    },
    {
      q: "Can I use the premium light mode and dark mode?",
      a: "Yes! CareerOS AI includes a gorgeous dark interface and a custom-tailored white/light SaaS theme that propagates instantly across the entire application workspace."
    }
  ];

  return (
    <div className="space-y-24 pb-20 animate-fadeIn max-w-7xl mx-auto overflow-hidden">
      
      {/* ==========================================
         =============== HERO SECTION ===============
         ========================================== */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24">
        
        {/* Glow decoration blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#7C5CFF]/5 rounded-full blur-3xl animate-pulse pointer-events-none z-0" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#A855F7]/5 rounded-full blur-3xl animate-pulse pointer-events-none z-0" />
        
        <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero text content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#7C5CFF] text-xs font-bold font-mono uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" />
              <span>Version 1.1 Stable</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-brand-text-bright font-display">
                The Intelligent <br />
                <span className="text-gradient bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] bg-clip-text text-transparent">
                  Career Operating System.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-brand-text-secondary font-medium leading-relaxed max-w-2xl">
                An all-in-one platform to audit your resume against ATS criteria, optimize bullet metrics, match job scopes, and prepare for interviews.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/workspace"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7C5CFF] hover:bg-[#6A4BE0] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all"
              >
                <span>Enter Workspace</span>
                <ArrowRight size={16} />
              </Link>
              
              <Link
                to="/analyzer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-card hover:bg-brand-card-hover border border-brand-border text-brand-text-primary hover:text-brand-text-bright font-bold text-sm uppercase tracking-wider rounded-2xl shadow-sm transition-all"
              >
                <FileText size={16} />
                <span>Quick Upload & Scan</span>
              </Link>
            </div>

            {/* Micro value badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-brand-border text-xs text-brand-text-muted font-mono font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Zero Subscription fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Real-time Gemini Model</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>PDF / Word Support</span>
              </div>
            </div>

          </div>

          {/* Hero visual illustration */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-[420px] aspect-square rounded-3xl bg-gradient-to-br from-[#7C5CFF]/3 to-[#A855F7]/3 border border-brand-border shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden animate-float-slow">
              
              {/* Floating lights */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#A855F7]/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7C5CFF]/10 rounded-full blur-2xl animate-pulse" />

              {/* Dynamic Mock Interface card */}
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#7C5CFF] bg-[#7C5CFF]/10 px-2 py-0.5 rounded-md">Live Parsing Audit</span>
                </div>

                <div className="p-4 bg-brand-bg/80 border border-brand-border rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-brand-text-primary">CareerOS_Audit_v1.pdf</span>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">✔ OK</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-brand-border rounded overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] rounded" />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-brand-text-muted">
                      <span>Analyzing section density</span>
                      <span>84% Match</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live scoring wheel widget mockup */}
              <div className="p-4 bg-brand-card/90 border border-brand-border rounded-2xl flex items-center justify-between gap-4 shadow-lg relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold text-brand-text-muted uppercase">Global Rating</p>
                  <p className="text-xl font-black text-brand-text-primary">Excellent</p>
                </div>
                <div className="h-12 w-12 rounded-full border-4 border-[#7C5CFF]/20 border-t-[#7C5CFF] flex items-center justify-center font-black text-xs text-[#7C5CFF]">
                  84%
                </div>
              </div>

              {/* Action item mockup */}
              <div className="p-3 bg-brand-bg border border-brand-border rounded-xl text-[10px] text-brand-text-secondary leading-normal relative z-10 flex items-start gap-2">
                <span className="p-1 bg-amber-500/10 text-amber-500 rounded font-bold shrink-0">XYZ</span>
                <div>
                  <p className="font-bold text-brand-text-primary">Google Bullet Improvement</p>
                  <p className="text-brand-text-muted mt-0.5">Quantified bullet increase of 25% throughput</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
         ============= STATISTICS SECTION ============
         ========================================== */}
      <section className="relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-brand-card border border-brand-border text-center space-y-2 hover:scale-[1.02] transition-transform duration-300 shadow-sm relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
              <p className="text-4xl sm:text-5xl font-black text-indigo-500 dark:text-indigo-400 font-display">{stat.value}</p>
              <h4 className="text-sm font-bold text-brand-text-primary">{stat.label}</h4>
              <p className="text-[11px] text-brand-text-muted font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
         ============== FEATURES SECTION ============
         ========================================== */}
      <section className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full">Suite Modules</span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-text-bright tracking-tight font-display">
            Built for Recruiters. Perfected by AI.
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary font-medium">
            Discover modular utility layers created to address resume gaps, semantic buzzword bloat, and enterprise compliance hurdles.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            const isActive = feat.status === "Active";
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl bg-brand-card border border-brand-border hover:border-indigo-500/20 flex flex-col justify-between transition-all duration-300 relative group h-full shadow-sm hover:shadow-lg ${
                  !isActive ? "opacity-70 border-dashed" : "hover:-translate-y-1"
                }`}
              >
                <div className="space-y-4">
                  {/* Icon header */}
                  <div className="flex items-center justify-between">
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border border-brand-border ${feat.color}`}>
                      <Icon size={20} />
                    </div>
                    {feat.badge && (
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-mono font-bold rounded uppercase">
                        {feat.badge}
                      </span>
                    )}
                  </div>

                  {/* Body text */}
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-brand-text-primary text-base font-display">{feat.title}</h3>
                    <p className="text-brand-text-muted text-xs leading-relaxed font-medium">{feat.description}</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-brand-border flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-brand-text-muted">
                  <span>Module Status:</span>
                  <span className={isActive ? "text-emerald-500" : "text-slate-400"}>{feat.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
         ============ HOW IT WORKS (STEPS) ===========
         ========================================== */}
      <section className="p-8 sm:p-12 rounded-3xl bg-brand-card border border-brand-border relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C5CFF]/3 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold text-[#7C5CFF] uppercase tracking-widest bg-[#7C5CFF]/5 px-3 py-1 rounded-full">Process Map</span>
          <h2 className="text-3xl font-bold text-brand-text-bright tracking-tight font-display">How CareerOS Works</h2>
          <p className="text-xs text-brand-text-secondary font-semibold leading-relaxed">
            Follow a simple, reliable 5-step operational architecture to convert drafts into responsive recruitment assets.
          </p>
        </div>

        <div className="relative grid md:grid-cols-5 gap-8">
          
          {/* Flow path connecting lines */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-[#7C5CFF]/15 via-[#A855F7]/15 to-[#7C5CFF]/15 z-0" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-4">
              
              {/* Numeric indicator */}
              <div className="h-14 w-14 rounded-2xl bg-brand-bg border border-brand-border shadow-sm flex items-center justify-center font-extrabold text-[#7C5CFF] text-lg tracking-tight font-display hover:scale-105 transition-transform duration-300 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl" />
                {step.num}
              </div>

              {/* Details card content */}
              <div className="space-y-1 max-w-[180px]">
                <h4 className="font-extrabold text-sm text-brand-text-primary font-display">{step.title}</h4>
                <p className="text-[11px] text-brand-text-muted font-medium leading-relaxed">{step.desc}</p>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
         ============== TESTIMONIALS ===============
         ========================================== */}
      <section className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full">Success Stories</span>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-text-bright tracking-tight font-display">Loved by Technical Specialists</h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary font-medium">
            Hear directly from developers, product designers, and technical team managers who successfully redesigned their credentials.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-brand-card border border-brand-border flex flex-col justify-between space-y-6 shadow-sm relative hover:scale-[1.01] transition-transform duration-300">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="text-brand-text-secondary text-xs italic leading-relaxed font-semibold">
                  "{test.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-brand-border pt-4">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/15 flex items-center justify-center font-extrabold text-xs">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-brand-text-primary leading-none">{test.author}</h4>
                  <p className="text-[10px] text-brand-text-muted font-medium mt-1">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
         ================ FAQ SECTION ================
         ========================================== */}
      <section className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-bold text-[#7C5CFF] uppercase tracking-widest bg-[#7C5CFF]/5 px-3 py-1 rounded-full">Resolution Hub</span>
          <h2 className="text-3xl font-bold text-brand-text-bright tracking-tight font-display">Frequently Asked Questions</h2>
          <p className="text-xs text-brand-text-secondary font-medium">
            Find answers to common operational questions regarding parser mechanics, system storage, and support policies.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left text-brand-text-primary font-bold text-sm hover:bg-brand-card-hover transition-colors cursor-pointer"
                >
                  <span className="font-display pr-4">{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-[#7C5CFF] shrink-0" /> : <ChevronDown size={16} className="text-[#7C5CFF] shrink-0" />}
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-brand-text-secondary font-semibold leading-relaxed border-t border-brand-border bg-brand-bg/20">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
         ================ CTA BANNER ================
         ========================================== */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#7C5CFF] to-[#A855F7] text-white text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-6 max-w-xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold tracking-tight leading-tight font-display">Ready to Land Your Next Role?</h2>
          <p className="text-xs text-indigo-100 font-semibold leading-relaxed">
            Enter our unified candidate workspace, upload your document layer, and let our AI model perform automated segment scoring in seconds.
          </p>
          <div className="pt-2">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#7C5CFF] hover:bg-indigo-50 text-xs tracking-wider uppercase font-black rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
         ================= FOOTER ==================
         ========================================== */}
      <footer className="border-t border-brand-border pt-12 pb-6 text-xs text-brand-text-muted font-semibold">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card border border-brand-border text-[#7C5CFF] shadow-sm">
                <CareerOSLogo className="w-5 h-5 text-[#7C5CFF]" />
              </div>
              <span className="font-extrabold text-sm text-brand-text-primary tracking-tight font-display">
                CareerOS
              </span>
            </div>
            <p className="text-[11px] text-brand-text-secondary leading-relaxed">
              Propelling technical careers using metric-centric algorithms and high-compliance ATS analysis tools.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-brand-text-primary uppercase tracking-widest text-[10px] font-mono">Company</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-brand-text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-text-primary transition-colors">Career Pathways</a></li>
              <li><a href="#" className="hover:text-brand-text-primary transition-colors">Affiliate Suite</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-brand-text-primary uppercase tracking-widest text-[10px] font-mono">Features</h4>
            <ul className="space-y-2 text-[11px]">
              <li><Link to="/workspace" className="hover:text-brand-text-primary transition-colors">Analysis Workspace</Link></li>
              <li><Link to="/analyzer" className="hover:text-brand-text-primary transition-colors">Document Parser</Link></li>
              <li><Link to="/improve" className="hover:text-brand-text-primary transition-colors">Bullet Optimizer</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-brand-text-primary uppercase tracking-widest text-[10px] font-mono">Privacy & Policy</h4>
            <ul className="space-y-2 text-[11px]">
              <li><a href="#" className="hover:text-brand-text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-text-primary transition-colors">Security Rules</a></li>
              <li><a href="#" className="hover:text-brand-text-primary transition-colors">Cookies Config</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider text-brand-text-muted">
          <span>© 2026 CareerOS AI. All rights Reserved.</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-brand-text-primary transition-colors flex items-center gap-1">
              <Github size={13} />
              <span>GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-brand-text-primary transition-colors flex items-center gap-1">
              <Linkedin size={13} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
