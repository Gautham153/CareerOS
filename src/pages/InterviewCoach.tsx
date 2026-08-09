/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { FeatureGate } from "../components/FeatureGate";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  ChevronRight,
  ChevronLeft,
  Award,
  Briefcase,
  History,
  User,
  Check,
  X,
  Plus,
  Compass,
  LineChart,
  BookOpen,
  Volume2,
  VolumeX,
  Save,
  Undo2,
  ListRestart
} from "lucide-react";
import { useAnalysis } from "../hooks/useAnalysis";
import { apiService } from "../services/api";

// Local storage keys
const COACH_HISTORY_KEY = "resume_iq_interview_coach_history";
const OPTIMIZED_RESUME_KEY = "resume_iq_rewriter_sections";

interface CoachHistoryItem {
  id: string;
  timestamp: string;
  role: string;
  company: string;
  interviewType: string;
  difficulty: string;
  interviewerStyle: string;
  score: number;
  badge: string;
  duration: number; // in seconds
  questionsCount: number;
}

interface QuestionState {
  id: string;
  question: string;
  category: string;
  expectedPoints: string[];
  hint: string;
  userAnswer?: string;
  evaluation?: {
    score: number;
    feedback: string;
    idealAnswer: string;
    pointsMatched: string[];
    pointsMissed: string[];
    recruiterTip: string;
  };
  isEvaluating?: boolean;
}

export default function InterviewCoach() {
  const { currentFile, activeResumeText } = useAnalysis();
  const navigate = useNavigate();

  // 1. Session Setup States
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("General");
  const [customCompany, setCustomCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState("Mixed Interview");
  const [difficulty, setDifficulty] = useState("Medium");
  const [interviewLength, setInterviewLength] = useState(5);
  const [interviewerStyle, setInterviewerStyle] = useState("Professional");

  const [isSettingUp, setIsSettingUp] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 2. Active Session States
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [userNotes, setUserNotes] = useState("");
  const [showHint, setShowHint] = useState(false);

  // Input Type Selection
  const [inputMode, setInputMode] = useState<"type" | "voice">("type");
  const [currentAnswerText, setCurrentAnswerText] = useState("");

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 3. Post-Session States
  const [isFinished, setIsFinished] = useState(false);
  const [historyList, setHistoryList] = useState<CoachHistoryItem[]>([]);

  // Soundwave mock state
  const [soundwaveBars, setSoundwaveBars] = useState<number[]>([15, 10, 25, 18, 30, 20, 15, 25, 10]);

  // Load from storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(COACH_HISTORY_KEY);
      if (savedHistory) {
        setHistoryList(JSON.parse(savedHistory));
      }

      // Check if SpeechRecognition is supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setCurrentAnswerText((prev) => {
              const cleanedPrev = prev.trim();
              return cleanedPrev ? cleanedPrev + " " + finalTranscript : finalTranscript;
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Try pre-populating target role & description from latest job match if available
      const jobMatchHistoryStr = localStorage.getItem("resume_iq_job_match_history");
      if (jobMatchHistoryStr) {
        const parsedHistory = JSON.parse(jobMatchHistoryStr);
        if (parsedHistory && parsedHistory.length > 0) {
          const latestItem = parsedHistory[0];
          if (latestItem.role) {
            setTargetRole(latestItem.role);
          }
          if (latestItem.company && latestItem.company !== "Not specified") {
            setCustomCompany(latestItem.company);
            setTargetCompany("Custom");
          }
          if (latestItem.jobDescription) {
            setJobDescription(latestItem.jobDescription);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load setup parameters:", err);
    }
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isSettingUp && !isFinished && !isGenerating && isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSettingUp, isFinished, isGenerating, isTimerRunning]);

  // Soundwave animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setSoundwaveBars(soundwaveBars.map(() => Math.floor(Math.random() * 35) + 5));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Voice recognition toggle
  const toggleListening = () => {
    if (!voiceSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start voice recognition:", e);
      }
    }
  };

  // Helper to get formatted elapsed time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // 1-Click Import from Job Match
  const handleAutoImport = () => {
    try {
      const jobMatchHistoryStr = localStorage.getItem("resume_iq_job_match_history");
      if (jobMatchHistoryStr) {
        const parsedHistory = JSON.parse(jobMatchHistoryStr);
        if (parsedHistory && parsedHistory.length > 0) {
          const latest = parsedHistory[0];
          setTargetRole(latest.role || "");
          setJobDescription(latest.jobDescription || "");
          if (latest.company && latest.company !== "Not specified" && latest.company !== "General") {
            setTargetCompany("Custom");
            setCustomCompany(latest.company);
          } else {
            setTargetCompany("General");
            setCustomCompany("");
          }
          // Notify user
          setError(null);
        } else {
          setError("No past Job Match results found to import. Please run Job Match first.");
        }
      } else {
        setError("No past Job Match results found. Please run Job Match first.");
      }
    } catch {
      setError("Unable to import Job Match results.");
    }
  };

  // Generate Questions handler
  const handleStartInterview = async () => {
    if (!activeResumeText) {
      setError("An active resume is required. Please upload a resume first.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);
    setError(null);

    const actualCompany = targetCompany === "Custom" ? customCompany : targetCompany;

    // Simulation steps for gorgeous progress UX
    const timers = [
      setTimeout(() => setGenerationStep(1), 1000),
      setTimeout(() => setGenerationStep(2), 2200),
      setTimeout(() => setGenerationStep(3), 3600),
    ];

    try {
      // Load optimized sections from Rewriter if they exist to provide extra context
      let optimizedText = "";
      try {
        const savedRewrites = localStorage.getItem(OPTIMIZED_RESUME_KEY);
        if (savedRewrites) {
          const parsed = JSON.parse(savedRewrites);
          optimizedText = Object.entries(parsed)
            .map(([section, text]) => `SECTION [${section.toUpperCase()}]:\n${text}`)
            .join("\n\n");
        }
      } catch {}

      // Get latest job match results summary for premium personalization
      let matchSummary = "";
      try {
        const matchHistoryStr = localStorage.getItem("resume_iq_job_match_history");
        if (matchHistoryStr) {
          const parsed = JSON.parse(matchHistoryStr);
          if (parsed && parsed.length > 0) {
            const latest = parsed[0];
            matchSummary = `ATS Score: ${latest.matchScore}%\nStrengths: ${latest.result?.resume_strengths?.slice(0, 3).join(", ")}\nWeaknesses: ${latest.result?.resume_weaknesses?.slice(0, 3).join(", ")}`;
          }
        }
      } catch {}

      // Call API
      const result = await apiService.generateCoachQuestions({
        resumeText: activeResumeText,
        optimizedResumeText: optimizedText,
        targetRole: targetRole || "Software Professional",
        jobDescription: jobDescription,
        jobMatchResults: matchSummary,
        interviewType,
        difficulty,
        style: interviewerStyle,
        company: actualCompany || "General",
        count: interviewLength
      });

      // Clear simulation timers
      timers.forEach(clearTimeout);

      if (result.questions && result.questions.length > 0) {
        const formatted = result.questions.map((q: any, i: number) => ({
          ...q,
          id: q.id || `q_${i}`,
          userAnswer: ""
        }));
        setQuestions(formatted);
        setCurrentIndex(0);
        setSessionTimer(0);
        setIsSettingUp(false);
      } else {
        throw new Error("No questions returned from AI. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate customized interview questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Evaluate single question response
  const handleSubmitAnswer = async () => {
    if (!currentAnswerText.trim()) {
      setError("Please type or speak your answer before submitting.");
      return;
    }

    if (isListening) {
      toggleListening(); // Stop mic if listening
    }

    setError(null);

    // Set evaluating state
    const updatedQuestions = [...questions];
    updatedQuestions[currentIndex].isEvaluating = true;
    updatedQuestions[currentIndex].userAnswer = currentAnswerText;
    setQuestions(updatedQuestions);

    try {
      const response = await apiService.evaluateCoachAnswer({
        question: questions[currentIndex].question,
        expectedPoints: questions[currentIndex].expectedPoints,
        userAnswer: currentAnswerText,
        resumeText: activeResumeText || "",
        targetRole: targetRole || "Software Professional",
        jobDescription: jobDescription,
        interviewType,
        difficulty,
        style: interviewerStyle
      });

      const evaluated = [...questions];
      evaluated[currentIndex].isEvaluating = false;
      evaluated[currentIndex].evaluation = response.evaluation;
      setQuestions(evaluated);
      setShowHint(false);
    } catch (err: any) {
      const evaluated = [...questions];
      evaluated[currentIndex].isEvaluating = false;
      setQuestions(evaluated);
      setError("AI was unable to score this answer. You can proceed or try again.");
    }
  };

  const handleNextQuestion = () => {
    setError(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswerText(questions[currentIndex + 1].userAnswer || "");
      setUserNotes("");
      setShowHint(false);
    } else {
      handleCompleteInterview();
    }
  };

  const handlePrevQuestion = () => {
    setError(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setCurrentAnswerText(questions[currentIndex - 1].userAnswer || "");
      setUserNotes("");
      setShowHint(false);
    }
  };

  const handleSkipQuestion = () => {
    setError(null);
    const updated = [...questions];
    updated[currentIndex].userAnswer = "[User skipped this question]";
    updated[currentIndex].evaluation = {
      score: 0,
      feedback: "You skipped this question. Skipping prevents active learning or tracking.",
      idealAnswer: "No custom answer could be generated for a skipped question.",
      pointsMatched: [],
      pointsMissed: questions[currentIndex].expectedPoints,
      recruiterTip: "Try to provide even a partial response during mock interviews. Giving up limits candidate evaluation."
    };
    setQuestions(updated);
    handleNextQuestion();
  };

  const handleCompleteInterview = () => {
    // 1. Calculate overall score
    const evaluated = questions.filter(q => q.evaluation);
    const totalScore = evaluated.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0);
    const avgScore = evaluated.length > 0 ? Math.round(totalScore / evaluated.length) : 0;

    // 2. Select badge based on performance
    let badge = "Novice Practitioner";
    if (avgScore >= 90) badge = "STAR Method Titan";
    else if (avgScore >= 80) badge = "Confidence Alchemist";
    else if (avgScore >= 70) badge = "Competent Professional";
    else if (avgScore >= 50) badge = "Active Learner";

    // 3. Save to history
    const actualCompany = targetCompany === "Custom" ? customCompany : targetCompany;
    const historyItem: CoachHistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      role: targetRole || "Software Professional",
      company: actualCompany || "General",
      interviewType,
      difficulty,
      interviewerStyle,
      score: avgScore,
      badge,
      duration: sessionTimer,
      questionsCount: questions.length
    };

    const nextHistory = [historyItem, ...historyList].slice(0, 15);
    setHistoryList(nextHistory);
    try {
      localStorage.setItem(COACH_HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (err) {
      console.error("Failed to save history:", err);
    }

    setIsFinished(true);
  };

  const handleResetSession = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSessionTimer(0);
    setCurrentAnswerText("");
    setIsSettingUp(true);
    setIsFinished(false);
    setError(null);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter(h => h.id !== id);
    setHistoryList(updated);
    try {
      localStorage.setItem(COACH_HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Calculate dynamic dimensions for Post-Session Analytics Dashboard
  const getDimensionScores = () => {
    const evaluated = questions.filter(q => q.evaluation);
    if (evaluated.length === 0) {
      return { communication: 65, structure: 60, technical: 65, metrics: 55 };
    }

    // Determine dimensions logically from category
    let techScores: number[] = [];
    let behaviorScores: number[] = [];
    let metricsScores: number[] = [];

    evaluated.forEach((q) => {
      const score = q.evaluation?.score || 0;
      if (["Technical", "System Design", "Coding"].includes(q.category)) {
        techScores.push(score);
      } else {
        behaviorScores.push(score);
      }
      // Deduce metrics score based on whether pointsMatched has mentions of percentages/metrics
      const matchedCount = q.evaluation?.pointsMatched?.length || 0;
      const missedCount = q.evaluation?.pointsMissed?.length || 0;
      const metricsRate = matchedCount / Math.max(1, matchedCount + missedCount);
      metricsScores.push(Math.round(metricsRate * 40 + score * 0.6));
    });

    const average = (arr: number[], fallback: number) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : fallback;

    const overallAvg = average(evaluated.map(q => q.evaluation?.score || 0), 70);

    return {
      technical: average(techScores, overallAvg),
      structure: average(behaviorScores, Math.min(95, overallAvg + 5)),
      communication: Math.min(98, Math.round(overallAvg * 0.8 + 20)),
      metrics: average(metricsScores, Math.max(40, overallAvg - 10))
    };
  };

  const dimensions = getDimensionScores();
  const overallAvgScore = questions.filter(q => q.evaluation).length > 0
    ? Math.round(questions.filter(q => q.evaluation).reduce((a, b) => a + (b.evaluation?.score || 0), 0) / questions.filter(q => q.evaluation).length)
    : 0;

  return (
    <FeatureGate requiredPlan="PREMIUM">
      <div className="space-y-8 max-w-7xl mx-auto pb-16 relative">
      {/* Background glow effects */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER CARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950/40 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg ring-1 ring-white/10">
            <Mic size={22} className="animate-pulse text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white font-display uppercase tracking-tight">AI Interview Coach</h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black tracking-widest uppercase">
                Flagship
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Engage in immersive, realistic AI mock interviews tailored to your active resume and target career roles.
            </p>
          </div>
        </div>

        {activeResumeText && !isSettingUp && (
          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-white/5">
              <Clock size={13} className="text-indigo-400" />
              <span>Session: {formatTime(sessionTimer)}</span>
            </div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 bg-slate-950 border border-white/5 rounded-xl hover:text-white hover:bg-white/5 transition-all text-slate-400"
              title={isTimerRunning ? "Pause Timer" : "Start Timer"}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={handleResetSession}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl border border-rose-500/15 transition-all"
            >
              <ListRestart size={13} />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-500/10 border border-rose-500/15 rounded-2xl text-rose-400 text-xs font-semibold flex items-center gap-3 shadow-lg"
        >
          <AlertCircle size={16} className="shrink-0 text-rose-500" />
          <div className="flex-1">
            <span className="font-bold">Heads up: </span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 text-rose-400 hover:text-white">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* VIEW RENDERER */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: WELCOME & SETUP */}
        {isSettingUp && !isGenerating && !isFinished && (
          <motion.div
            key="setup-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* SETUP FORM */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#090D1A]/90 backdrop-blur-md border border-white/5 shadow-2xl space-y-6 relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
                
                <div>
                  <h2 className="text-base font-extrabold text-white">Interview Configuration</h2>
                  <p className="text-xs text-slate-400 mt-1">Specify your target goals to let Gemini custom design your session.</p>
                </div>

                {/* TARGET DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Professional Role</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Company / Preset</label>
                    <div className="flex gap-2">
                      <select
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        className="px-3 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-semibold"
                      >
                        <option value="General">General Practice</option>
                        <option value="Google">Google</option>
                        <option value="Microsoft">Microsoft</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Meta">Meta</option>
                        <option value="Apple">Apple</option>
                        <option value="Netflix">Netflix</option>
                        <option value="Startup">Early Stage Startup</option>
                        <option value="Custom">Custom Company...</option>
                      </select>

                      {targetCompany === "Custom" && (
                        <input
                          type="text"
                          value={customCompany}
                          onChange={(e) => setCustomCompany(e.target.value)}
                          placeholder="Company Name..."
                          className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-semibold"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* JOB DESCRIPTION (OPTIONAL) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Job Description (Optional but Recommended)</label>
                    <button
                      onClick={handleAutoImport}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Compass size={11} />
                      1-Click Import Latest Job Match
                    </button>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description or requirements here to let the AI weave custom behavioral & technical questions targeting its exact keywords..."
                    className="w-full h-24 px-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* PARAMETERS CONFIG */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">Interview Type</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Mixed Interview">Mixed Session</option>
                      <option value="Technical Interview">Technical Round</option>
                      <option value="Behavioral Interview">Behavioral (STAR)</option>
                      <option value="HR Interview">HR & Culture Fit</option>
                      <option value="System Design">System Design</option>
                      <option value="Project Discussion">Project Deep-Dive</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Easy">Easy (Entry level)</option>
                      <option value="Medium">Medium (Mid level)</option>
                      <option value="Hard">Hard (Senior level)</option>
                      <option value="Expert">Expert (Principal / Staff)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">Session Length</label>
                    <select
                      value={interviewLength}
                      onChange={(e) => setInterviewLength(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value={3}>3 Questions (Express)</option>
                      <option value={5}>5 Questions (Standard)</option>
                      <option value={8}>8 Questions (In-depth)</option>
                      <option value={12}>12 Questions (Marathon)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display">Interviewer Persona</label>
                    <select
                      value={interviewerStyle}
                      onChange={(e) => setInterviewerStyle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/5 rounded-xl text-xs text-slate-300 font-bold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Professional">Professional Manager</option>
                      <option value="Strict Recruiter">Strict Recruiter</option>
                      <option value="Friendly Coach">Friendly Coach</option>
                      <option value="Startup Founder">Startup Founder</option>
                      <option value="Technical Lead">Technical Lead</option>
                    </select>
                  </div>
                </div>

                {/* INITIATE BUTTON */}
                <div className="pt-4">
                  {activeResumeText ? (
                    <button
                      onClick={handleStartInterview}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs tracking-widest uppercase shadow-lg shadow-indigo-500/20 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <Sparkles size={16} />
                      Generate Personalized Session
                    </button>
                  ) : (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/15 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 text-amber-400 text-xs font-semibold">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>Please upload a resume first to generate custom, context-aware questions.</span>
                      </div>
                      <Link
                        to="/analyzer"
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
                      >
                        Upload Resume
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SIDEBAR STATUS / HISTORICAL LIST */}
            <div className="space-y-6">
              {/* STATUS CARD */}
              <div className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 shadow-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Resume Integration Status</h3>
                
                {currentFile ? (
                  <div className="flex items-start gap-3 p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                    <FileText className="text-indigo-400 shrink-0 mt-0.5" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{currentFile.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Active text context synced</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-center text-xs text-rose-400 font-semibold">
                    No active resume scanned
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                    <p className="text-lg font-black text-indigo-400">PRO</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Session Tier</p>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5">
                    <p className="text-lg font-black text-purple-400">Ready</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Mock Engine</p>
                  </div>
                </div>
              </div>

              {/* PAST PRACTICE SESSIONS */}
              <div className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Practice History</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500">{historyList.length} Sessions</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {historyList.length > 0 ? (
                    historyList.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-3 relative group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200 truncate">{item.role}</p>
                          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 mt-1">
                            <span>{item.company}</span>
                            <span>•</span>
                            <span>{item.questionsCount} Qs</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`h-8 w-8 rounded-xl flex items-center justify-center font-mono font-black text-xs border ${
                            item.score >= 85
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : item.score >= 70
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}>
                            {item.score}
                          </span>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete record"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-600 font-semibold">
                      No past practice sessions. Your completed sessions will appear here!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: LOADING GENERATION */}
        {isGenerating && (
          <motion.div
            key="generating-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12 text-center min-h-[400px] rounded-3xl bg-[#090D1A]/60 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl ring-1 ring-white/10 shrink-0">
                <Sparkles size={28} className="animate-spin text-indigo-100" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-white">Forging Practice Session</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
              Gemini AI is parsing your active resume accomplishments and cross-matching them with target requirements...
            </p>

            {/* Simulated Live Logs */}
            <div className="mt-8 p-4 bg-slate-950 border border-white/5 rounded-2xl font-mono text-[10px] text-slate-400 max-w-md w-full text-left space-y-2.5">
              <p className={generationStep >= 0 ? "text-indigo-400" : "text-slate-600"}>
                {generationStep >= 0 ? "⌛ Booting flagship ATS Interview Prep modules..." : "○ Waiting..."}
              </p>
              <p className={generationStep >= 1 ? "text-emerald-400" : "text-slate-600"}>
                {generationStep >= 1 ? "✔ Loaded Active Resume context successfully." : "○ Analyzing resume text..."}
              </p>
              <p className={generationStep >= 2 ? "text-indigo-400" : "text-slate-600"}>
                {generationStep >= 2 ? "⌛ Mapping role requirements & company specific standards..." : "○ Weaving target preferences..."}
              </p>
              <p className={generationStep >= 3 ? "text-purple-400 animate-pulse" : "text-slate-600"}>
                {generationStep >= 3 ? "⌛ Synthesizing hyper-tailored behaviorals & technical algorithms..." : "○ Finalizing questions array..."}
              </p>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: ACTIVE INTERVIEW WORKSPACE */}
        {!isSettingUp && !isGenerating && !isFinished && questions.length > 0 && (
          <motion.div
            key="active-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* LEFT PANEL: INTERVIEWER & QUESTION (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#090D1A]/90 backdrop-blur-md border border-white/5 shadow-2xl space-y-6 relative flex flex-col justify-between min-h-[460px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                {/* Question progress and category bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 text-[10px] font-bold tracking-wider font-mono uppercase">
                      {questions[currentIndex].category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                  </div>

                  {/* Little custom progress indicator bar */}
                  <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* THE QUESTION DISPLAY */}
                <div className="my-8 flex-1 flex flex-col justify-center">
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    Interviewer ({interviewerStyle}):
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed tracking-tight select-text">
                    "{questions[currentIndex].question}"
                  </h3>
                </div>

                {/* RECUPERATING COACH HINTS */}
                <div className="shrink-0 space-y-4">
                  <div>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={13} className="text-indigo-400 shrink-0" />
                      <span>{showHint ? "Hide Coach Tip" : "Show Recruiter Tip / Strategy"}</span>
                    </button>

                    <AnimatePresence>
                      {showHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-4 bg-slate-950 border border-white/5 rounded-2xl text-xs text-slate-400 leading-relaxed space-y-2"
                        >
                          <p className="font-bold text-slate-200">Suggested Strategy:</p>
                          <p>{questions[currentIndex].hint}</p>
                          <p className="font-bold text-slate-200 mt-2">Core points to touch:</p>
                          <ul className="list-disc pl-4 space-y-1 text-slate-500">
                            {questions[currentIndex].expectedPoints.map((pt, idx) => (
                              <li key={idx}>{pt}</li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-950 border border-white/5 hover:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>

                    {/* Question navigation dot array */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {questions.map((q, idx) => (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentIndex(idx);
                            setCurrentAnswerText(questions[idx].userAnswer || "");
                          }}
                          className={`h-2.5 w-2.5 rounded-full transition-all ${
                            idx === currentIndex
                              ? "bg-indigo-500 ring-2 ring-indigo-500/30 scale-125"
                              : q.evaluation
                              ? "bg-emerald-500"
                              : q.userAnswer
                              ? "bg-indigo-400"
                              : "bg-slate-800"
                          }`}
                          title={`Go to Question ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleSkipQuestion}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                    >
                      Skip Q
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: YOUR RESPONSE / INTERACTION (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 shadow-2xl space-y-4">
                {/* Mode Select Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Your Answer</h3>
                  
                  <div className="flex gap-1.5 p-0.5 bg-slate-950 rounded-xl border border-white/5 shrink-0">
                    <button
                      onClick={() => setInputMode("type")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        inputMode === "type" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Type Mode
                    </button>
                    <button
                      onClick={() => setInputMode("voice")}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                        inputMode === "voice" ? "bg-indigo-500 text-white shadow" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Mic size={10} />
                      Voice Practice
                    </button>
                  </div>
                </div>

                {/* INPUT WORKSPACE */}
                {inputMode === "type" ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={currentAnswerText}
                        onChange={(e) => setCurrentAnswerText(e.target.value)}
                        placeholder="Type out your response here. Try to use standard frameworks (Situation, Task, Action, Result) and mention specific technologies & metrics..."
                        className="w-full h-48 px-4 py-3 bg-slate-950/60 border border-white/5 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                        disabled={questions[currentIndex].isEvaluating}
                      />
                      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 font-bold">
                        {currentAnswerText.split(/\s+/).filter(Boolean).length} words
                      </div>
                    </div>
                  </div>
                ) : (
                  /* VOICE PRACTICE INTERFACE */
                  <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
                    {/* Glowing Mic Button */}
                    <button
                      onClick={toggleListening}
                      disabled={!voiceSupported}
                      className={`h-20 w-20 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                        isListening
                          ? "bg-rose-500 border-rose-400 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-105"
                          : "bg-indigo-500/10 border-indigo-500/15 text-indigo-400 hover:bg-indigo-500/20 shadow-[0_4px_12px_rgba(99,102,241,0.1)] hover:scale-[1.02]"
                      } disabled:opacity-45 disabled:cursor-not-allowed`}
                    >
                      {isListening ? (
                        <MicOff size={32} className="text-white shrink-0 animate-pulse" />
                      ) : (
                        <Mic size={32} className="shrink-0" />
                      )}
                    </button>

                    {/* Soundwave representation */}
                    <div className="h-8 flex items-end justify-center gap-1 shrink-0">
                      {isListening ? (
                        soundwaveBars.map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-rose-400 rounded-full transition-all duration-100"
                            style={{ height: `${h}px` }}
                          />
                        ))
                      ) : (
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                          {voiceSupported ? "Tap microphone to record" : "Speech API not supported in browser"}
                        </p>
                      )}
                    </div>

                    {/* Live Transcribed Text Block */}
                    <div className="w-full relative">
                      <textarea
                        value={currentAnswerText}
                        onChange={(e) => setCurrentAnswerText(e.target.value)}
                        placeholder="Your spoken words will appear here. You can edit this text at any point manually to polish the answer before submitting..."
                        className="w-full h-28 px-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none leading-normal"
                        disabled={questions[currentIndex].isEvaluating}
                      />
                    </div>
                  </div>
                )}

                {/* PERSONAL SCRATCHPAD */}
                <div>
                  <textarea
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="📝 Private Scratchpad: jot down bullet points, key technologies, or ideas to remember before answering... (Will not be submitted)"
                    className="w-full h-12 px-3 py-2 bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 rounded-xl text-[11px] text-slate-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500/30 transition-all resize-none leading-normal"
                  />
                </div>

                {/* SUBMIT TRIGGER ACTIONS */}
                <div className="pt-2">
                  {!questions[currentIndex].evaluation && !questions[currentIndex].isEvaluating && (
                    <button
                      onClick={handleSubmitAnswer}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                    >
                      <Sparkles size={14} />
                      Submit & Score Answer
                    </button>
                  )}

                  {questions[currentIndex].isEvaluating && (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/15 rounded-xl text-indigo-400 text-xs font-semibold flex items-center justify-center gap-2.5">
                      <RefreshCw size={14} className="animate-spin shrink-0" />
                      <span>Gemini AI is analyzing and scoring your response...</span>
                    </div>
                  )}

                  {questions[currentIndex].evaluation && !questions[currentIndex].isEvaluating && (
                    <div className="space-y-4">
                      {/* SCORE PREVIEW */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Question Score</p>
                          <h4 className="text-xl font-black text-white mt-1">
                            {questions[currentIndex].evaluation?.score} / 100
                          </h4>
                        </div>

                        <span className={`h-10 px-3.5 rounded-lg font-bold text-xs flex items-center justify-center border uppercase font-mono ${
                          (questions[currentIndex].evaluation?.score || 0) >= 85
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : (questions[currentIndex].evaluation?.score || 0) >= 70
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}>
                          {(questions[currentIndex].evaluation?.score || 0) >= 85 ? "Excellent" : (questions[currentIndex].evaluation?.score || 0) >= 70 ? "Good" : "Practice"}
                        </span>
                      </div>

                      {/* ACTIONS TO GO NEXT */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleSubmitAnswer}
                          className="flex-1 py-2.5 bg-slate-950 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <Undo2 size={13} />
                          Re-try Answer
                        </button>
                        <button
                          onClick={handleNextQuestion}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/10"
                        >
                          <span>{currentIndex === questions.length - 1 ? "Finish Session" : "Next Question"}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LIVE FEEDBACK CARD SLIDE DOWN (If evaluated) */}
            {questions[currentIndex].evaluation && !questions[currentIndex].isEvaluating && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-12 p-6 sm:p-8 rounded-3xl bg-[#090D1A]/90 border border-white/5 shadow-2xl space-y-6"
              >
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    AI Evaluation & Critique
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Detailed, granular critique of your specific answer.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CRITIQUE & ANALYSIS */}
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3">
                      <p className="font-bold text-xs text-indigo-400 uppercase tracking-widest">Constructive Critique</p>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        {questions[currentIndex].evaluation?.feedback}
                      </p>
                    </div>

                    <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
                      <p className="font-bold text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                        💡 Recruiter Inside Strategy
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        {questions[currentIndex].evaluation?.recruiterTip}
                      </p>
                    </div>
                  </div>

                  {/* POINTS MET / EXPERT IDEAL ANSWER */}
                  <div className="space-y-4">
                    {/* Points list */}
                    <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3">
                      <p className="font-bold text-xs text-slate-300 uppercase tracking-widest">Key Points Addressed</p>
                      <div className="space-y-2 text-xs">
                        {questions[currentIndex].evaluation?.pointsMatched.map((pt, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-emerald-400">
                            <CheckCircle size={14} className="shrink-0 mt-0.5" />
                            <span className="font-semibold">{pt}</span>
                          </div>
                        ))}
                        {questions[currentIndex].evaluation?.pointsMissed.map((pt, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-slate-500">
                            <X size={14} className="shrink-0 mt-0.5" />
                            <span className="font-medium">{pt} (Missed)</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ideal answer */}
                    <div className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3 relative overflow-hidden">
                      <p className="font-bold text-xs text-emerald-400 uppercase tracking-widest">Ideal Answer Exemplar</p>
                      <div className="max-h-[140px] overflow-y-auto custom-scrollbar select-text text-xs text-slate-400 leading-relaxed font-semibold pr-1">
                        "{questions[currentIndex].evaluation?.idealAnswer}"
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* VIEW 4: POST-INTERVIEW ANALYTICS DASHBOARD */}
        {isFinished && (
          <motion.div
            key="finished-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-8"
          >
            {/* OVERALL RESULTS BOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* PRIMARY KPI CARD */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#090D1A] border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden text-center sm:text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Session Summary</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-4 py-2 justify-center sm:justify-start">
                    <span className={`h-16 w-16 rounded-2xl font-mono font-black text-2xl flex items-center justify-center border ${
                      overallAvgScore >= 85
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : overallAvgScore >= 70
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {overallAvgScore}%
                    </span>
                    <div>
                      <h4 className="text-base font-extrabold text-white">Interview Readiness</h4>
                      <p className="text-xs text-slate-400 mt-1 font-semibold">
                        {overallAvgScore >= 85
                          ? "Incredible! You are highly structured and ready to ace interviews."
                          : overallAvgScore >= 70
                          ? "Good alignment. A little more STAR method structure and you are fully set."
                          : "Needs active practice. Focus on metrics, STAR structures, and typing out precise points."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-3 justify-center sm:justify-start shrink-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400">
                    <Award size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Unlocked Achievement</p>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">
                      {overallAvgScore >= 90
                        ? "🏆 STAR Method Titan"
                        : overallAvgScore >= 80
                        ? "🎯 Confidence Alchemist"
                        : "🌱 Active Learner"}
                    </p>
                  </div>
                </div>
              </div>

              {/* RADIAL / DIMENSIONAL CHART BOARD */}
              <div className="p-6 rounded-3xl bg-slate-950/40 border border-white/5 shadow-2xl space-y-4 lg:col-span-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Dimension Analytics</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center">
                    <p className="text-base font-black text-indigo-400">{dimensions.technical}%</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Technical Accuracy</p>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-indigo-400 h-full" style={{ width: `${dimensions.technical}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center">
                    <p className="text-base font-black text-purple-400">{dimensions.structure}%</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Structure (STAR)</p>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-purple-400 h-full" style={{ width: `${dimensions.structure}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center">
                    <p className="text-base font-black text-emerald-400">{dimensions.communication}%</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Communication</p>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-emerald-400 h-full" style={{ width: `${dimensions.communication}%` }} />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 text-center">
                    <p className="text-base font-black text-amber-400">{dimensions.metrics}%</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Metric Focus</p>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3">
                      <div className="bg-amber-400 h-full" style={{ width: `${dimensions.metrics}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PRACTICE QUESTIONS DETAIL LIST */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#090D1A]/90 border border-white/5 shadow-2xl space-y-6">
              <div>
                <h3 className="text-base font-black text-white">Question Breakdown & Feedback</h3>
                <p className="text-xs text-slate-400 mt-1">Review the specific feedback and ideal answers for each question.</p>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-4 sm:p-5 bg-slate-950/60 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0 pr-4 select-text">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Q{idx + 1}</span>
                        <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded text-[8px] font-bold uppercase tracking-wider font-mono">
                          {q.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white">"{q.question}"</h4>
                      <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                        <span className="text-indigo-400 font-bold block mb-1">AI Critique:</span>
                        {q.evaluation?.feedback || "No feedback generated."}
                      </p>
                    </div>

                    <div className="flex md:flex-col justify-between md:justify-center items-center gap-3 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-5 shrink-0">
                      <div>
                        <p className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">Score</p>
                        <p className="text-lg font-black text-white text-center mt-0.5">{q.evaluation?.score || 0}%</p>
                      </div>

                      <span className={`h-7 px-3 rounded-lg font-bold text-[9px] flex items-center justify-center border uppercase font-mono ${
                        (q.evaluation?.score || 0) >= 85
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : (q.evaluation?.score || 0) >= 70
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {(q.evaluation?.score || 0) >= 85 ? "Excellent" : (q.evaluation?.score || 0) >= 70 ? "Good" : "Practice"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* POST SESSION ACTION PANEL */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  onClick={handleResetSession}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-indigo-600/10"
                >
                  <ListRestart size={14} />
                  Practice Again
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-3 bg-slate-950 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-xs font-black tracking-wider uppercase text-slate-400 hover:text-white cursor-pointer transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </FeatureGate>
  );
}
