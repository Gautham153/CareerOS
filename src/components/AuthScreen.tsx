/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { authService } from "../services/firebase";
import { useApp } from "../context/AppContext";
import { CareerOSLogo } from "./CareerOSLogo";
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";

export default function AuthScreen() {
  const { addSystemNotification } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email || (!isForgotPassword && !password)) {
      setError("Please fill out all required fields.");
      addSystemNotification("Please fill out all required fields.", "error");
      setLoading(false);
      return;
    }

    try {
      if (isForgotPassword) {
        await authService.resetPassword(email);
        setSuccess("Password reset instructions have been dispatched to your email address.");
        addSystemNotification(`Password reset request submitted for ${email}`, "info");
      } else if (isLogin) {
        await authService.signIn(email, password);
        addSystemNotification("Welcome back! Signed in successfully.", "success");
      } else {
        if (!name) {
          setError("Name is required to build your professional profile.");
          addSystemNotification("Name is required to build your professional profile.", "error");
          setLoading(false);
          return;
        }
        await authService.signUp(email, password, name);
        addSystemNotification(`Welcome to CareerOS, ${name}! Your profile is ready.`, "success");
      }
    } catch (err: any) {
      console.error("Authentication exception:", err);
      const code = err.code || err.message || "";
      let friendlyMessage = "An unexpected error occurred. Please try again.";

      if (code.includes("email-already-in-use")) {
        friendlyMessage = "This email address is already associated with an active account.";
      } else if (code.includes("wrong-password") || code.includes("invalid-credential")) {
        friendlyMessage = "Invalid credentials. Please verify your email and password.";
      } else if (code.includes("user-not-found")) {
        friendlyMessage = "No active account found for this email address.";
      } else if (code.includes("invalid-email")) {
        friendlyMessage = "Please enter a valid email address.";
      } else if (code.includes("weak-password")) {
        friendlyMessage = "The password is too weak. Please use at least 6 characters.";
      } else if (code.includes("missing-fields") || code.includes("missing-password")) {
        friendlyMessage = "Please fill out all required fields.";
      } else if (err.message) {
        friendlyMessage = err.message;
      }

      setError(friendlyMessage);
      addSystemNotification(friendlyMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070F] text-slate-200 relative overflow-hidden font-sans p-4">
      {/* Dynamic atmospheric backdrops */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,92,255,0.06),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.04),transparent_40%)]" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-[gradient-to-t,from-[#0a0f24,to-[#05070F]]] opacity-80" />

      {/* Floating background glowing lines */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl -top-64 -left-64 animate-pulse pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl -bottom-64 -right-64 animate-pulse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#090D1A]/90 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 backdrop-blur-md"
      >
        {/* Glow corner highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Head Block logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black text-white shadow-xl mb-4 relative group">
            <div className="absolute inset-0 rounded-2xl bg-[#7C5CFF]/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
            <CareerOSLogo className="w-6 h-6 text-[#7C5CFF] relative z-10" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight font-display">
            {isForgotPassword ? "Recover Password" : isLogin ? "Welcome to CareerOS" : "Create Professional Account"}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 max-w-[280px]">
            {isForgotPassword 
              ? "Specify your email to retrieve recovery procedures." 
              : isLogin 
                ? "Access your unified ATS scores, resume metrics, and coach."
                : "Initialize your workspace sandbox in a few quick steps."
            }
          </p>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Display general success/errors */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-start gap-2.5"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-semibold flex items-start gap-2.5"
            >
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Name Field (Sign up only) */}
          {!isLogin && !isForgotPassword && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gautham Nair"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 hover:border-white/10 focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/10 text-xs text-white rounded-xl placeholder-slate-600 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500">
                <Mail size={15} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gautham153@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 hover:border-white/10 focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/10 text-xs text-white rounded-xl placeholder-slate-600 focus:outline-none transition-all font-semibold"
              />
            </div>
          </div>

          {/* Password field */}
          {!isForgotPassword && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-[10px] text-[#7C5CFF] hover:text-[#6A4BE0] font-bold"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 hover:border-white/10 focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/10 text-xs text-white rounded-xl placeholder-slate-600 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          )}

          {/* Submission button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-[#7C5CFF] hover:bg-[#6A4BE0] disabled:bg-[#7C5CFF]/40 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all group"
          >
            {loading ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>
                  {isForgotPassword ? "Transmit Link" : isLogin ? "Authenticate Credentials" : "Initialize Account"}
                </span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer switches */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4 text-center">
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setError(null);
                setSuccess(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Back to Authenticate</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400">
              {isLogin ? "New candidate profile? " : "Already have a profile? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                }}
                className="text-[#7C5CFF] hover:text-[#6A4BE0] font-extrabold"
              >
                {isLogin ? "Create One" : "Log In"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
