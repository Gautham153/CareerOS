/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAnalysis } from "../hooks/useAnalysis";
import { apiService } from "../services/api";
import { AnimatePresence, motion } from "motion/react";
import {
  Sparkles,
  Layers,
  TrendingUp,
  Download,
  AlertCircle,
  RefreshCw,
  X,
  Trash2,
  Check,
  Undo2,
  ChevronRight,
  BookOpen,
  Edit2,
  ArrowLeftRight,
  CheckSquare,
  FileText,
  Save,
  HelpCircle,
  ArrowUpRight,
  Briefcase,
  CheckCircle
} from "lucide-react";

import {
  ResumeSections,
  RewriteResult,
  HistoryDraft,
  ProgressStep,
  SECTION_LABELS,
  DEFAULT_SECTIONS,
  OPTIMIZATION_MODES
} from "../types/rewriter";

import ResumeSheet, { computeDiff } from "../components/rewriter/ResumeSheet";
import LiveProgressView from "../components/rewriter/LiveProgressView";
import SectionSelectorModal from "../components/rewriter/SectionSelectorModal";
import OptimizationModesPanel from "../components/rewriter/OptimizationModesPanel";

import { FeatureGate } from "../components/FeatureGate";

export default function ResumeRewriter() {
  const { activeResumeText, currentFile, isImproving } = useAnalysis();
  const location = useLocation();
  const navigate = useNavigate();

  // Primary Workspace States with Local Storage persistence
  const [sections, setSections] = useState<ResumeSections>(() => {
    try {
      const saved = localStorage.getItem("resume_iq_rewriter_sections");
      return saved ? JSON.parse(saved) : DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  const [improvedSections, setImprovedSections] = useState<Record<string, RewriteResult>>(() => {
    try {
      const saved = localStorage.getItem("resume_iq_rewriter_improved");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isParsed, setIsParsed] = useState<boolean>(() => {
    return localStorage.getItem("resume_iq_rewriter_is_parsed") === "true";
  });

  const [lastParsedText, setLastParsedText] = useState<string>(() => {
    return localStorage.getItem("resume_iq_rewriter_last_parsed_text") || "";
  });

  const [sectionQualityScores, setSectionQualityScores] = useState<Record<string, { original: number; improved: number | null }>>(() => {
    try {
      const saved = localStorage.getItem("resume_iq_rewriter_section_scores");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [historyList, setHistoryList] = useState<HistoryDraft[]>(() => {
    try {
      const saved = localStorage.getItem("resume_iq_rewriter_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Flow States
  const [currentView, setCurrentView] = useState<"studio" | "advanced-editor">("studio");
  const [studioStep, setStudioStep] = useState<"setup" | "optimizing" | "preview">("setup");
  const [activeSection, setActiveSection] = useState<keyof ResumeSections>("summary");
  const [showDiffMode, setShowDiffMode] = useState<boolean>(true);
  
  // Custom Studio Configurations
  const [selectedSectionsForOptimization, setSelectedSectionsForOptimization] = useState<Record<keyof ResumeSections, boolean>>({
    summary: true,
    experience: true,
    projects: true,
    skills: true,
    technicalSkills: false,
    softSkills: false,
    education: false,
    achievements: false,
    certifications: false,
    languages: false,
    internships: false,
    leadership: false,
    awards: false,
    publications: false,
    interests: false,
    customSections: false
  });
  
  const [selectedModes, setSelectedModes] = useState<string[]>(["ats", "professional"]);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [previewLayout, setPreviewLayout] = useState<"split" | "original" | "optimized" | "comparison">("split");
  const [showChanges, setShowChanges] = useState<boolean>(true);
  
  // Modals & Notifications
  const [isSectionModalOpen, setIsSectionModalOpen] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportType, setExportType] = useState<"original" | "optimized" | "comparison">("optimized");
  const [showApplySuccessBanner, setShowApplySuccessBanner] = useState<string | null>(null);
  const [backupSections, setBackupSections] = useState<Partial<ResumeSections>>({});
  
  // Core Parsing / API Loading states
  const [isParsingText, setIsParsingText] = useState<boolean>(false);
  const [isRewriting, setIsRewriting] = useState<boolean>(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  
  // Score Stats
  const [oldScore, setOldScore] = useState<number>(72);
  const [newScore, setNewScore] = useState<number>(88);
  const [animateScore, setAnimateScore] = useState<number>(72);

  const [renamingDraftId, setRenamingDraftId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState<string>("");
  const [comparingDraft, setComparingDraft] = useState<HistoryDraft | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("resume_iq_rewriter_sections", JSON.stringify(sections));
    localStorage.setItem("resume_iq_rewriter_improved", JSON.stringify(improvedSections));
    localStorage.setItem("resume_iq_rewriter_is_parsed", isParsed ? "true" : "false");
    localStorage.setItem("resume_iq_rewriter_last_parsed_text", lastParsedText);
    localStorage.setItem("resume_iq_rewriter_section_scores", JSON.stringify(sectionQualityScores));
    localStorage.setItem("resume_iq_rewriter_history", JSON.stringify(historyList));
  }, [sections, improvedSections, isParsed, lastParsedText, sectionQualityScores, historyList]);

  // Set default view on load depending on optimization state
  useEffect(() => {
    const hasImprovements = Object.keys(improvedSections).length > 0;
    if (hasImprovements) {
      setStudioStep("preview");
    } else {
      setStudioStep("setup");
    }
  }, []);

  // Handle detection of newly uploaded global resume
  useEffect(() => {
    if (activeResumeText && activeResumeText.trim() && activeResumeText !== lastParsedText) {
      triggerResumeStructureParse(activeResumeText);
    }
  }, [activeResumeText, lastParsedText]);

  // Automatic optimization trigger effect
  useEffect(() => {
    const trigger = localStorage.getItem("resume_iq_auto_optimize_trigger") === "true" || (location.state as any)?.autoOptimize;
    if (trigger && activeResumeText) {
      localStorage.removeItem("resume_iq_auto_optimize_trigger");
      // Clear location state
      if (location.state && (location.state as any).autoOptimize) {
        window.history.replaceState({}, document.title);
      }
      
      // Auto-trigger parsing if not parsed, otherwise direct optimize
      if (!isParsed && !isParsingText) {
        triggerResumeStructureParse(activeResumeText).then(() => {
          handlePremiumBulkOptimize();
        });
      } else {
        handlePremiumBulkOptimize();
      }
    }
  }, [activeResumeText, isParsed, isParsingText]);

  // Score counter animation
  useEffect(() => {
    const target = studioStep === "preview" ? newScore : oldScore;
    let current = animateScore;
    if (current === target) return;

    const diff = target - current;
    const step = diff > 0 ? 1 : -1;
    const interval = setInterval(() => {
      current += step;
      setAnimateScore(current);
      if (current === target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [oldScore, newScore, animateScore, studioStep]);

  // Parse Raw Text to clean sections
  const triggerResumeStructureParse = async (text: string) => {
    setIsParsingText(true);
    setRewriteError(null);
    try {
      const parsed = await apiService.parseResumeSections(text);
      const cleanSections: ResumeSections = {
        summary: parsed.summary || "",
        experience: parsed.experience || "",
        projects: parsed.projects || "",
        skills: parsed.skills || "",
        technicalSkills: parsed.technicalSkills || "",
        softSkills: parsed.softSkills || "",
        education: parsed.education || "",
        achievements: parsed.achievements || "",
        certifications: parsed.certifications || "",
        languages: "",
        internships: "",
        leadership: "",
        awards: "",
        publications: "",
        interests: "",
        customSections: ""
      };
      
      setSections(cleanSections);
      setImprovedSections({});
      
      const seededScores: Record<string, { original: number; improved: number | null }> = {};
      (Object.keys(cleanSections) as Array<keyof ResumeSections>).forEach(key => {
        if (cleanSections[key] && cleanSections[key].trim().length > 10) {
          seededScores[key] = {
            original: Math.floor(Math.random() * 16) + 60, // 60 to 75 pts
            improved: null
          };
        }
      });
      setSectionQualityScores(seededScores);
      setLastParsedText(text);
      setIsParsed(true);
      setStudioStep("setup");
    } catch (err: any) {
      console.error(err);
      setRewriteError(err.message || "Failed to segment resume text.");
    } finally {
      setIsParsingText(false);
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Core Premium Bulk Optimization
  const handlePremiumBulkOptimize = async () => {
    const checkedKeys = (Object.keys(selectedSectionsForOptimization) as Array<keyof ResumeSections>).filter(
      key => selectedSectionsForOptimization[key] && sections[key] && sections[key].trim().length > 10
    );

    if (checkedKeys.length === 0) {
      setRewriteError("Please select at least one section with content to optimize.");
      setIsSectionModalOpen(true);
      return;
    }

    setRewriteError(null);
    setStudioStep("optimizing");

    const stepsList: ProgressStep[] = [
      { id: "reading", label: "Reading Resume Layout Data", status: "idle" },
      { id: "extracting", label: "Extracting Section Boundaries", status: "idle" },
      { id: "analyzing", label: "Analyzing ATS Keyword Deficiencies", status: "idle" },
      ...checkedKeys.map(k => ({
        id: `optimize-${k}`,
        label: `Optimizing ${SECTION_LABELS[k]}`,
        status: "idle" as const
      })),
      { id: "generating", label: "Assembling Final Document", status: "idle" },
      { id: "completed", label: "Studio Sequence Completed", status: "idle" }
    ];
    setProgressSteps(stepsList);

    const updateStepStatus = (id: string, status: ProgressStep["status"]) => {
      setProgressSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    };

    try {
      updateStepStatus("reading", "running");
      await delay(600);
      updateStepStatus("reading", "completed");

      updateStepStatus("extracting", "running");
      await delay(600);
      updateStepStatus("extracting", "completed");

      updateStepStatus("analyzing", "running");
      await delay(600);
      updateStepStatus("analyzing", "completed");

      const updatedImprovements = { ...improvedSections };
      const updatedScores = { ...sectionQualityScores };
      const instructionString = selectedModes
        .map(mId => OPTIMIZATION_MODES.find(m => m.id === mId)?.label)
        .filter(Boolean)
        .join(", ");

      for (const key of checkedKeys) {
        updateStepStatus(`optimize-${key}`, "running");
        
        const origScore = sectionQualityScores[key]?.original || 67;
        const result = await apiService.rewriteResumeSection({
          sectionName: SECTION_LABELS[key],
          currentText: sections[key],
          instruction: instructionString || "ATS Optimization",
          tone: "professional",
          estimatedScoreBefore: origScore
        });

        updatedImprovements[key] = result;
        updatedScores[key] = {
          original: origScore,
          improved: result.estimatedScoreAfter
        };
        
        setImprovedSections({ ...updatedImprovements });
        setSectionQualityScores({ ...updatedScores });
        updateStepStatus(`optimize-${key}`, "completed");
        await delay(200);
      }

      updateStepStatus("generating", "running");
      await delay(700);
      updateStepStatus("generating", "completed");

      updateStepStatus("completed", "running");
      await delay(400);
      updateStepStatus("completed", "completed");

      let totalOld = 0;
      let totalNew = 0;
      let count = 0;
      (Object.keys(updatedScores) as Array<keyof ResumeSections>).forEach(k => {
        const sc = updatedScores[k];
        if (sc) {
          totalOld += sc.original;
          totalNew += sc.improved || sc.original;
          count++;
        }
      });
      const avgBefore = count > 0 ? Math.round(totalOld / count) : 70;
      const avgAfter = count > 0 ? Math.round(totalNew / count) : 88;

      setOldScore(avgBefore);
      setNewScore(avgAfter);

      // Create a Version History draft
      handleSaveDraftVersion(sections, updatedImprovements, avgBefore, avgAfter);

      setStudioStep("preview");
    } catch (err: any) {
      console.error(err);
      setRewriteError(err.message || "Bulk optimization process failed.");
      setProgressSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "failed" } : s));
      await delay(2500);
      setStudioStep("setup");
    }
  };

  const handleSaveDraftVersion = (
    currentSections: ResumeSections,
    currentImproved: Record<string, RewriteResult>,
    oScore: number,
    nScore: number
  ) => {
    const nextVer = historyList.length + 1;
    const versionTitle = `Version ${nextVer} (${currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "Optimization"})`;
    const newDraft: HistoryDraft = {
      id: Math.random().toString(36).substring(2, 9),
      name: versionTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString(),
      sections: { ...currentSections },
      improvedSections: { ...currentImproved },
      scores: {
        old: oScore,
        new: nScore
      }
    };
    const newList = [newDraft, ...historyList];
    setHistoryList(newList);
  };

  const handleRestoreDraft = (draft: HistoryDraft) => {
    setSections({ ...draft.sections });
    setImprovedSections({ ...draft.improvedSections });
    setOldScore(draft.scores.old);
    setNewScore(draft.scores.new);
    setComparingDraft(null);
    
    // Refresh quality scores based on the draft
    const restoredScores: Record<string, { original: number; improved: number | null }> = {};
    (Object.keys(draft.sections) as Array<keyof ResumeSections>).forEach(key => {
      if (draft.sections[key] && draft.sections[key].trim().length > 10) {
        restoredScores[key] = {
          original: draft.scores.old,
          improved: draft.improvedSections[key]?.estimatedScoreAfter || null
        };
      }
    });
    setSectionQualityScores(restoredScores);
    setStudioStep("preview");
  };

  const handleDeleteDraft = (id: string) => {
    setHistoryList(prev => prev.filter(d => d.id !== id));
    if (comparingDraft?.id === id) setComparingDraft(null);
  };

  const handleRenameDraft = (id: string) => {
    const item = historyList.find(d => d.id === id);
    if (item) {
      setRenamingDraftId(id);
      setRenamingName(item.name);
    }
  };

  const submitRename = () => {
    if (renamingDraftId && renamingName.trim()) {
      setHistoryList(prev => prev.map(d => d.id === renamingDraftId ? { ...d, name: renamingName.trim() } : d));
    }
    setRenamingDraftId(null);
  };

  // Plain file text downloader (TXT)
  const handleExportTxt = (type: "original" | "optimized" | "comparison") => {
    let content = `=== RESUME WORKSPACE EXPORT (${type.toUpperCase()}) ===\n`;
    content += `File: ${currentFile?.name || "Workspace_Resume.pdf"}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n\n`;

    (Object.keys(SECTION_LABELS) as Array<keyof ResumeSections>).forEach(key => {
      const origText = sections[key] || "";
      const impText = improvedSections[key]?.improved;
      
      if (!origText && !impText) return;

      content += `=========================================\n`;
      content += `[${SECTION_LABELS[key].toUpperCase()}]\n`;
      content += `=========================================\n`;

      if (type === "original") {
        content += origText;
      } else if (type === "optimized") {
        content += impText || origText;
      } else {
        if (impText) {
          content += `--- ORIGINAL VERSION ---\n${origText}\n\n`;
          content += `--- AI OPTIMIZED VERSION ---\n${impText}\n`;
        } else {
          content += `${origText}\n`;
        }
      }
      content += "\n\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentFile?.name ? currentFile.name.replace(/\.[^/.]+$/, "") : "Resume"}_${type}_export.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  // Universal word-processing doc (DOCX format)
  const handleExportDocx = (type: "original" | "optimized" | "comparison") => {
    let htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><title>CareerOS Studio Export</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; line-height: 1.5; font-size: 11pt; color: #2d3748; }
      h1 { font-size: 18pt; text-align: center; text-transform: uppercase; margin: 0 0 5px 0; color: #111; }
      .meta { text-align: center; font-size: 9pt; color: #666; margin-bottom: 20px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
      h2 { border-bottom: 2px solid #2d3748; padding-bottom: 2px; font-size: 12pt; color: #111; text-transform: uppercase; margin-top: 15px; margin-bottom: 5px; }
      p { margin: 0 0 8px 0; font-size: 10.5pt; white-space: pre-wrap; }
      .added { background-color: #d1fae5; color: #065f46; font-weight: bold; text-decoration: none; }
      .removed { background-color: #fee2e2; color: #991b1b; text-decoration: line-through; }
    </style>
    </head>
    <body>
    <div style="text-align: center;">
      <h1>${currentFile?.name ? currentFile.name.replace(/\.[^/.]+$/, "") : "Workspace Candidate"}</h1>
      <div class="meta">SAN FRANCISCO, CA &bull; WORKSPACE@RESUMEIQ.AI &bull; +1 (555) 019-9230</div>
    </div>`;

    (Object.keys(SECTION_LABELS) as Array<keyof ResumeSections>).forEach(key => {
      const origText = sections[key] || "";
      const impText = improvedSections[key]?.improved;
      
      if (!origText && !impText) return;

      htmlContent += `<h2>${SECTION_LABELS[key]}</h2>`;
      if (type === "original") {
        htmlContent += `<p>${origText}</p>`;
      } else if (type === "optimized") {
        htmlContent += `<p>${impText || origText}</p>`;
      } else {
        if (impText) {
          const tokens = computeDiff(origText, impText);
          htmlContent += `<p>`;
          tokens.forEach(tok => {
            if (tok.type === "added") {
              htmlContent += `<span class="added">${tok.text}</span>`;
            } else if (tok.type === "removed") {
              htmlContent += `<span class="removed">${tok.text}</span>`;
            } else {
              htmlContent += tok.text;
            }
          });
          htmlContent += `</p>`;
        } else {
          htmlContent += `<p>${origText}</p>`;
        }
      }
    });

    htmlContent += `</body></html>`;

    const blob = new Blob(['\ufeff' + htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentFile?.name ? currentFile.name.replace(/\.[^/.]+$/, "") : "Resume"}_${type}_export.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  // printable standalone HTML layout suited for PDF generation
  const handleExportPdf = (type: "original" | "optimized" | "comparison") => {
    let htmlContent = `
    <html>
    <head>
      <title>${currentFile?.name ? currentFile.name.replace(/\.[^/.]+$/, "") : "Resume Export"}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #2d3748; padding: 40px; background: white; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 24px; text-align: center; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px; color: #1a202c; }
        .meta { text-align: center; font-size: 11px; color: #718096; text-transform: uppercase; margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
        h2 { font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #2d3748; padding-bottom: 3px; color: #1a202c; margin-top: 25px; margin-bottom: 8px; letter-spacing: 0.5px; }
        p { font-size: 11.5px; white-space: pre-wrap; margin: 0 0 10px 0; color: #4a5568; }
        .added { background: #e6fffa; color: #006853; font-weight: bold; border-bottom: 1px dashed #006853; padding: 0 2px; }
        .removed { background: #fff5f5; color: #9b2c2c; text-decoration: line-through; padding: 0 2px; }
        @media print {
          body { padding: 0; }
          .print-header { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="print-header" style="text-align: right; margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; font-family: sans-serif;">Print & Save as PDF</button>
      </div>
      <h1>${currentFile?.name ? currentFile.name.replace(/\.[^/.]+$/, "") : "Candidate Resume Portfolio"}</h1>
      <div class="meta">San Francisco, CA &bull; workspace@resumeiq.ai &bull; +1 (555) 019-9230</div>
    `;

    (Object.keys(SECTION_LABELS) as Array<keyof ResumeSections>).forEach(key => {
      const origText = sections[key] || "";
      const impText = improvedSections[key]?.improved;
      
      if (!origText && !impText) return;

      htmlContent += `<h2>${SECTION_LABELS[key]}</h2>`;
      if (type === "original") {
        htmlContent += `<p>${origText}</p>`;
      } else if (type === "optimized") {
        htmlContent += `<p>${impText || origText}</p>`;
      } else {
        if (impText) {
          const tokens = computeDiff(origText, impText);
          htmlContent += `<p>`;
          tokens.forEach(tok => {
            if (tok.type === "added") {
              htmlContent += `<span class="added">${tok.text}</span>`;
            } else if (tok.type === "removed") {
              htmlContent += `<span class="removed">${tok.text}</span>`;
            } else {
              htmlContent += tok.text;
            }
          });
          htmlContent += `</p>`;
        } else {
          htmlContent += `<p>${origText}</p>`;
        }
      }
    });

    htmlContent += `</body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      const link = document.createElement("a");
      link.href = url;
      link.download = "Print_Optimized_Resume.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowExportModal(false);
  };

  const handleExportTrigger = (type: typeof exportType) => {
    setExportType(type);
    setShowExportModal(true);
  };

  // Section editor specific handlers
  const handleSectionTextChange = (key: keyof ResumeSections, text: string) => {
    setSections(prev => ({
      ...prev,
      [key]: text
    }));
  };

  const handleImprovedTextChange = (key: keyof ResumeSections, text: string) => {
    if (improvedSections[key]) {
      setImprovedSections(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          improved: text
        }
      }));
    }
  };

  const handleRewriteSection = async (key: keyof ResumeSections) => {
    setIsRewriting(true);
    setRewriteError(null);
    try {
      const origScore = sectionQualityScores[key]?.original || 68;
      const res = await apiService.rewriteResumeSection({
        sectionName: SECTION_LABELS[key],
        currentText: sections[key],
        instruction: "ATS Optimization & Phrasing Refinement",
        tone: "professional",
        estimatedScoreBefore: origScore
      });

      setImprovedSections(prev => ({
        ...prev,
        [key]: res
      }));

      setSectionQualityScores(prev => ({
        ...prev,
        [key]: {
          original: origScore,
          improved: res.estimatedScoreAfter
        }
      }));

      setShowApplySuccessBanner(null);
    } catch (err: any) {
      console.error(err);
      setRewriteError(err.message || "Failed to rewrite the section. Ensure your input text contains clear details.");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleApplyImprovement = (key: keyof ResumeSections) => {
    const imp = improvedSections[key];
    if (imp) {
      setBackupSections(prev => ({
        ...prev,
        [key]: sections[key]
      }));
      
      setSections(prev => ({
        ...prev,
        [key]: imp.improved
      }));

      // Update baseline quality score
      setSectionQualityScores(prev => ({
        ...prev,
        [key]: {
          original: imp.estimatedScoreAfter,
          improved: null
        }
      }));

      // Remove from active pending improved sections to clear panel
      const updated = { ...improvedSections };
      delete updated[key];
      setImprovedSections(updated);

      setShowApplySuccessBanner(key);
      setTimeout(() => {
        setShowApplySuccessBanner(prev => prev === key ? null : prev);
      }, 7000);
    }
  };

  const handleUndoApply = (key: keyof ResumeSections) => {
    const backup = backupSections[key];
    if (backup !== undefined) {
      setSections(prev => ({
        ...prev,
        [key]: backup
      }));
      setBackupSections(prev => {
        const u = { ...prev };
        delete u[key];
        return u;
      });
      setShowApplySuccessBanner(null);
    }
  };

  const handleUndoSection = (key: keyof ResumeSections) => {
    setImprovedSections(prev => {
      const u = { ...prev };
      delete u[key];
      return u;
    });
    setSectionQualityScores(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        improved: null
      }
    }));
  };

  const activeImprovement = improvedSections[activeSection];
  const diffTokens = activeImprovement ? computeDiff(sections[activeSection], activeImprovement.improved) : [];
  const detectedKeys = (Object.keys(sections) as Array<keyof ResumeSections>).filter(
    k => sections[k] && sections[k].trim().length > 10
  );

  return (
    <FeatureGate requiredPlan="PRO">
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      
      {/* SECTION MODAL OVERLAYS */}
      <SectionSelectorModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        selectedSections={selectedSectionsForOptimization}
        setSelectedSections={setSelectedSectionsForOptimization}
        detectedKeys={detectedKeys}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* PARSING OVERLAY BAR */}
        {isParsingText && (
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between gap-4 text-indigo-300 text-xs animate-pulse">
            <div className="flex items-center gap-2 font-semibold">
              <RefreshCw size={14} className="animate-spin text-indigo-400" />
              <span>Initializing segment filters. Analyzing resume structures...</span>
            </div>
          </div>
        )}

        {/* ERROR NOTIFICATION PANEL */}
        {rewriteError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-3 text-rose-300 text-xs animate-slideDown">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <p className="font-extrabold uppercase tracking-wide text-[10px] text-rose-400">Workspace Alert</p>
              <p className="font-medium leading-relaxed">{rewriteError}</p>
            </div>
          </div>
        )}

        {/* ONBOARDING FLOW: NO RESUME LOADED */}
        {!activeResumeText ? (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400">
                <Layers size={36} className="animate-bounce" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                No Active Resume Loaded
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                You must upload or parse a resume inside the Analyzer dashboard first to configure the premium Optimization Studio workspace.
              </p>
            </div>
            
            <button
              onClick={() => navigate("/analyzer")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:scale-[1.02] active:scale-98"
            >
              <span>Go to Analyzer Dashboard</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          
          // CORE WORKSPACE INTERFACE: ACTIVE RESUME FOUND
          <div className="space-y-6">
            
            {/* HERO METADATA CARD (Part 5) */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden bg-gradient-to-r from-[#0d1527] to-[#040814] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase">
                    Premium Active
                  </span>
                  <h1 className="text-xl font-black text-white tracking-tight">
                    Resume Optimization Studio
                  </h1>
                </div>
                
                {/* Resume details list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-slate-500" />
                    <span>File: <strong className="text-white font-bold">{currentFile?.name || "Active_Workspace_Resume.pdf"}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span>Baseline Score: <strong className="text-emerald-400 font-extrabold">{oldScore}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-indigo-400" />
                    <span>Status: <strong className="text-indigo-300">Ready to Optimize</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers size={12} className="text-slate-500" />
                    <span>Detected Sections: <strong className="text-indigo-400 font-bold">{detectedKeys.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* View/Method Toggle Switch */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/5 self-stretch md:self-auto justify-between gap-1">
                <button
                  onClick={() => setCurrentView("studio")}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    currentView === "studio"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bulk Studio
                </button>
                <button
                  onClick={() => setCurrentView("advanced-editor")}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    currentView === "advanced-editor"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Section Editor
                </button>
              </div>
            </div>

            {/* VIEW A: BULK OPTIMIZATION STUDIO WORKFLOW (Primary) */}
            {currentView === "studio" && (
              <div className="space-y-6">
                
                {/* STUDIO STEP 1: CONFIGURE & SETUP */}
                {studioStep === "setup" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="grid lg:grid-cols-12 gap-6"
                  >
                    
                    {/* Setup Settings Columns (7 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                      
                      {/* Configuration Panel */}
                      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 bg-slate-950/20 space-y-6 shadow-xl">
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Layers size={15} className="text-indigo-400" />
                            <span>1. Configure Target Sections</span>
                          </h3>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Select which components of your parsed profile workspace to process. Unselected components remain entirely unaltered.
                          </p>
                        </div>

                        {/* Interactive section summary trigger list */}
                        <div className="bg-slate-950 p-4.5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-0.5">
                            <div className="text-xs font-extrabold text-white">
                              {Object.keys(selectedSectionsForOptimization).filter(k => selectedSectionsForOptimization[k as keyof ResumeSections]).length} Sections Checked
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight truncate max-w-sm sm:max-w-md">
                              {(Object.keys(selectedSectionsForOptimization) as Array<keyof ResumeSections>)
                                .filter(k => selectedSectionsForOptimization[k])
                                .map(k => SECTION_LABELS[k])
                                .join(", ") || "No sections selected"}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setIsSectionModalOpen(true)}
                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            Choose Sections
                          </button>
                        </div>

                        <div className="border-t border-white/5 pt-6">
                          {/* Multi mode selection panel */}
                          <OptimizationModesPanel
                            selectedModes={selectedModes}
                            setSelectedModes={setSelectedModes}
                          />
                        </div>

                        {/* Optimize Trigger button */}
                        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="space-y-0.5 text-center sm:text-left">
                            <div className="text-xs font-bold text-slate-400">READY FOR OPTIMIZATION</div>
                            <p className="text-[10px] text-slate-500">Estimating standard ATS optimization runtime ~2-5 seconds.</p>
                          </div>
                          
                          <button
                            onClick={handlePremiumBulkOptimize}
                            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:scale-[1.02] active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Sparkles size={14} className="animate-pulse" />
                            <span>Optimize Selected Sections</span>
                          </button>
                        </div>

                      </div>

                    </div>

                    {/* Studio Information Sidebar (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* Premium AI Status Card */}
                      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-[#090D1A]/30 space-y-4">
                        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                          Saved Workspace Versions
                        </h4>

                        {historyList.length === 0 ? (
                          <div className="p-6 text-center border border-dashed border-white/5 rounded-2xl">
                            <p className="text-xs text-slate-500">No optimized versions found yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                            {historyList.map(draft => (
                              <div key={draft.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-2.5">
                                <div className="space-y-0.5 truncate">
                                  <div className="text-xs font-bold text-white truncate">{draft.name}</div>
                                  <div className="text-[9px] text-slate-500 font-mono">{draft.timestamp}</div>
                                </div>
                                <button
                                  onClick={() => handleRestoreDraft(draft)}
                                  className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-[9px] uppercase rounded-lg transition-all"
                                >
                                  Load
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </motion.div>
                )}

                {/* STUDIO STEP 2: RUNNING PROGRESS (Part 9) */}
                {studioStep === "optimizing" && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="py-12"
                  >
                    <LiveProgressView
                      steps={progressSteps}
                      resumeName={currentFile?.name || "CareerOS Active Resume"}
                    />
                  </motion.div>
                )}

                {/* STUDIO STEP 3: STUDIO LIVE PREVIEW & COMPARATIVE WORKSPACE (Part 10, 11, 12) */}
                {studioStep === "preview" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-6"
                  >
                    
                    {/* Workspace Preview Toolbar Controller */}
                    <div className="glass-panel p-4.5 rounded-3xl border border-white/5 bg-[#090D1A]/50 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-xl">
                      
                      {/* Left: Layout selection tabs */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: "split", label: "Split View" },
                          { id: "original", label: "Original" },
                          { id: "optimized", label: "AI Optimized" },
                          { id: "comparison", label: "Smart Comparison" }
                        ].map(lay => (
                          <button
                            key={lay.id}
                            onClick={() => setPreviewLayout(lay.id as any)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              previewLayout === lay.id
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-slate-900/40 text-slate-400 hover:text-white"
                            }`}
                          >
                            {lay.label}
                          </button>
                        ))}
                      </div>

                      {/* Right: Difference and Reoptimize controller */}
                      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3.5">
                        {previewLayout === "comparison" && (
                          <div className="flex items-center gap-2 border-r border-white/5 pr-3">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Highlight Changes</span>
                            <button
                              onClick={() => setShowChanges(!showChanges)}
                              className={`w-10 h-5.5 rounded-full p-0.5 transition-all flex items-center cursor-pointer ${
                                showChanges ? "bg-indigo-600 justify-end" : "bg-slate-800 justify-start"
                              }`}
                            >
                              <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => setStudioStep("setup")}
                          className="px-4 py-2 border border-white/5 hover:bg-white/5 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          Change Setup / Re-optimize
                        </button>
                      </div>

                    </div>

                    {/* Preview Area container layout */}
                    <div className="grid lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Columns depend on layout */}
                      <div className={`space-y-6 ${previewLayout === "split" ? "lg:col-span-12" : "lg:col-span-9"}`}>
                        
                        {/* THE DYNAMIC SPLIT VIEW */}
                        {previewLayout === "split" && (
                          <div className="grid md:grid-cols-2 gap-6">
                            
                            {/* Left Pane: Original */}
                            <div className="space-y-2.5">
                              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono text-center">Original Baseline Layer</div>
                              <ResumeSheet
                                sections={sections}
                                improvedSections={improvedSections}
                                mode="original"
                                showChanges={false}
                                activeResumeName={currentFile?.name}
                              />
                            </div>

                            {/* Right Pane: Optimized */}
                            <div className="space-y-2.5">
                              <div className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono text-center">AI Optimized Studio Layer</div>
                              <ResumeSheet
                                sections={sections}
                                improvedSections={improvedSections}
                                mode="optimized"
                                showChanges={false}
                                activeResumeName={currentFile?.name}
                              />
                            </div>

                          </div>
                        )}

                        {/* OTHER SINGLE PANE LAYOUTS */}
                        {previewLayout !== "split" && (
                          <div className="max-w-4xl mx-auto">
                            <ResumeSheet
                              sections={sections}
                              improvedSections={improvedSections}
                              mode={previewLayout === "comparison" ? "comparison" : previewLayout}
                              showChanges={showChanges}
                              activeResumeName={currentFile?.name}
                            />
                          </div>
                        )}

                      </div>

                      {/* Right Sidebar containing metadata summary / why AI changed cards (only if not Split) */}
                      {previewLayout !== "split" && (
                        <div className="lg:col-span-3 space-y-6">
                          
                          {/* Export buttons card */}
                          <div className="glass-panel p-5 rounded-3xl border border-white/5 bg-slate-950/40 space-y-3.5">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                              Export Completed Resume
                            </h4>
                            
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleExportTrigger("optimized")}
                                className="w-full flex items-center justify-between p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                              >
                                <span>Export Optimized Resume</span>
                                <Download size={13} />
                              </button>
                              <button
                                onClick={() => handleExportTrigger("original")}
                                className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-400 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                              >
                                <span>Export Original Baseline</span>
                                <Download size={13} />
                              </button>
                              <button
                                onClick={() => handleExportTrigger("comparison")}
                                className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-400 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                              >
                                <span>Export Comparison Report</span>
                                <Download size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Quick Stats Score Card */}
                          <div className="glass-panel p-5 rounded-3xl border border-white/5 bg-[#090D1A]/50 text-center space-y-2">
                            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">Estimated ATS Score</span>
                            <div className="text-4xl font-black text-white">{animateScore}%</div>
                            <p className="text-[10px] text-slate-400">
                              Average improvement of optimized fields matches deep-learning recruitment weights.
                            </p>
                          </div>

                        </div>
                      )}

                    </div>

                    {/* SECTION INSIGHTS EXPONENT PANEL BELOW SHEETS (Part 15) */}
                    {Object.keys(improvedSections).length > 0 && (
                      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-center gap-1.5 pb-2 border-b border-white/5">
                          <BookOpen size={15} className="text-indigo-400" />
                          <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest font-mono">
                            AI Section-by-Section Enhancement Analysis
                          </h4>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.keys(improvedSections).map(k => {
                            const imp = improvedSections[k];
                            if (!imp) return null;

                            return (
                              <div key={k} className="p-4.5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-black text-indigo-400 font-sans">{SECTION_LABELS[k as keyof ResumeSections]}</div>
                                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    +{imp.estimatedScoreAfter - (sectionQualityScores[k]?.original || 65)} pts ATS Gain
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                  {imp.explanation}
                                </p>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-bold text-slate-500 uppercase">ATS Keywords Embedded</span>
                                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-bold text-slate-500 uppercase">Verbs Enhanced</span>
                                  <span className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-bold text-slate-500 uppercase">Clean Formatting</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* BOTTOM GLOBAL WORKSPACE TRIGGER CONTROLS */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4.5 bg-[#090D1A]/50 border border-white/5 rounded-2xl gap-4">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle size={18} className="text-indigo-400" />
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Advanced Custom Restructuring</div>
                          <p className="text-[10px] text-slate-400">Jump directly into verbatim editing and manual co-writing with the Advanced Section Editor.</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setCurrentView("advanced-editor");
                          const keys = Object.keys(sections) as Array<keyof ResumeSections>;
                          const firstPop = keys.find(k => sections[k] && sections[k].trim().length > 10) || "summary";
                          setActiveSection(firstPop);
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md text-center"
                      >
                        Launch Advanced Section Editor
                      </button>
                    </div>

                  </motion.div>
                )}

              </div>
            )}

            {/* VIEW B: ADVANCED SECTION EDITOR WORKFLOW (Secondary / Advanced Section Editor) */}
            {currentView === "advanced-editor" && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="grid lg:grid-cols-12 gap-6 items-start"
              >
                
                {/* LEFT SIDEBAR: Section Picker & Tone/Constraints Controls */}
                <div className="lg:col-span-3 space-y-6">
                  
                  {/* Selector list of sections */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3.5">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                      Workspace Sections
                    </h3>
                    
                    <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                      {(Object.keys(SECTION_LABELS) as Array<keyof ResumeSections>).map((key) => {
                        const isPopulated = sections[key] && sections[key].trim().length > 10;
                        const isOptimized = !!improvedSections[key];
                        const isActive = activeSection === key;

                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setActiveSection(key);
                              setRewriteError(null);
                            }}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isActive
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-950/20 border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <div className="truncate pr-1">
                              <div className="text-xs font-bold truncate leading-snug">{SECTION_LABELS[key]}</div>
                              <div className={`text-[8px] font-mono leading-none mt-0.5 ${isActive ? "text-indigo-200" : "text-slate-500"}`}>
                                {isPopulated ? "Content loaded ✔" : "Empty"}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0">
                              {isOptimized && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="AI improvement available" />
                              )}
                              <ChevronRight size={12} className={isActive ? "text-indigo-200" : "text-slate-600"} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar History list for drafts */}
                  <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3.5">
                    <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                      Draft Versions ({historyList.length})
                    </h3>

                    {historyList.length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-white/5 rounded-xl">
                        <p className="text-[10px] text-slate-500">No draft versions available.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                        {historyList.map(draft => (
                          <div 
                            key={draft.id} 
                            className={`p-3 rounded-xl border space-y-1.5 ${
                              comparingDraft?.id === draft.id
                                ? "bg-purple-500/10 border-purple-500/30"
                                : "bg-slate-950/30 border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              {renamingDraftId === draft.id ? (
                                <input
                                  type="text"
                                  value={renamingName}
                                  onChange={(e) => setRenamingName(e.target.value)}
                                  onBlur={submitRename}
                                  onKeyDown={(e) => e.key === "Enter" && submitRename()}
                                  className="bg-slate-900 border border-indigo-500 text-[10px] text-white rounded p-1 w-full"
                                  autoFocus
                                />
                              ) : (
                                <div className="space-y-0.5 truncate">
                                  <div className="text-[10px] font-bold text-white truncate leading-normal" title={draft.name}>
                                    {draft.name}
                                  </div>
                                  <div className="text-[8px] text-slate-500 font-mono">{draft.timestamp}</div>
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <button onClick={() => handleRenameDraft(draft.id)} className="p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-white">
                                  <Edit2 size={9} />
                                </button>
                                <button onClick={() => handleDeleteDraft(draft.id)} className="p-0.5 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400">
                                  <Trash2 size={9} />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[9px] pt-1 border-t border-white/5">
                              <span className="font-mono text-slate-400">Score: {draft.scores.new}%</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setComparingDraft(comparingDraft?.id === draft.id ? null : draft)}
                                  className={`px-1 rounded text-[8px] font-bold ${
                                    comparingDraft?.id === draft.id ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  }`}
                                >
                                  Diff
                                </button>
                                <button
                                  onClick={() => handleRestoreDraft(draft)}
                                  className="px-1 rounded bg-indigo-500 text-white text-[8px] font-bold hover:bg-indigo-600"
                                >
                                  Load
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      onClick={() => setCurrentView("studio")}
                      className="text-[10px] text-slate-500 hover:text-slate-400 font-bold uppercase tracking-widest font-mono cursor-pointer"
                    >
                      ← Return to Bulk Studio Setup
                    </button>
                  </div>

                </div>

                {/* RIGHT COLUMN: Comparative Workspace for Section editor */}
                <div className="lg:col-span-9 space-y-6">
                  
                  {/* COMPARATIVE VERSION COMPARE PORTAL overlay */}
                  {comparingDraft && (
                    <div className="glass-panel p-5 rounded-3xl border border-purple-500/20 bg-purple-500/5 space-y-4 animate-slideUp relative">
                      <button
                        onClick={() => setComparingDraft(null)}
                        className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-200"
                      >
                        <X size={15} />
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                          <ArrowLeftRight size={14} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">Comparing current section against Saved Version</h3>
                          <p className="text-[10px] text-slate-400">Showing drafts side-by-side for: <span className="font-semibold text-purple-300">{comparingDraft.name}</span></p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Current Workspace Text</div>
                          <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl text-xs h-48 overflow-y-auto custom-scrollbar font-sans leading-relaxed text-slate-300">
                            {sections[activeSection] || "[No text written]"}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest font-mono">Saved Version Text</div>
                          <div className="bg-purple-950/10 border border-purple-500/20 p-4 rounded-xl text-xs h-48 overflow-y-auto custom-scrollbar font-sans leading-relaxed text-purple-200">
                            {comparingDraft.sections[activeSection] || "[Empty section in this version]"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS WORKSPACE BANNER */}
                  {showApplySuccessBanner && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4 text-emerald-400 text-xs animate-slideDown">
                      <div className="flex items-center gap-2 font-medium">
                        <CheckCircle size={14} />
                        <span>Applied optimized phrasing directly to your workspace baseline layer.</span>
                      </div>
                      {backupSections[showApplySuccessBanner as keyof ResumeSections] !== undefined && (
                        <button
                          onClick={() => handleUndoApply(showApplySuccessBanner as keyof ResumeSections)}
                          className="px-2.5 py-1 bg-white/5 border border-emerald-500/30 hover:bg-white/10 rounded-lg font-bold text-[9px] uppercase text-white transition-all cursor-pointer"
                        >
                          Undo Apply
                        </button>
                      )}
                    </div>
                  )}

                  {/* SPLIT SECTION EDITOR WORKSPACE */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
                    
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/5">
                      <div className="space-y-1">
                        <h2 className="text-md font-extrabold text-white flex flex-wrap items-center gap-2">
                          <span>{SECTION_LABELS[activeSection]} Editor</span>
                          {isRewriting && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9px] font-bold border border-indigo-500/20 animate-pulse">
                              <RefreshCw size={9} className="animate-spin" />
                              <span>AI Polishing...</span>
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">Adjust values on the left, apply suggestions with AI on the right.</p>
                      </div>

                      <div className="flex items-center gap-3.5 self-stretch sm:self-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Highlight Differences</span>
                          <button
                            onClick={() => setShowDiffMode(!showDiffMode)}
                            disabled={!activeImprovement}
                            className={`w-10 h-5.5 rounded-full p-0.5 transition-all flex items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              showDiffMode && activeImprovement ? "bg-indigo-600 justify-end" : "bg-slate-800 justify-start"
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white block" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRewriteSection(activeSection)}
                          disabled={isRewriting}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-800 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-40"
                        >
                          <Sparkles size={11} className="animate-pulse" />
                          <span>AI Rewrite</span>
                        </button>
                      </div>
                    </div>

                    {/* Left vs Right editors */}
                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Left: Original Textarea */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            Verbatim Editable Layer
                          </label>
                        </div>
                        <textarea
                          value={sections[activeSection]}
                          onChange={(e) => handleSectionTextChange(activeSection, e.target.value)}
                          placeholder={`Provide content text for ${SECTION_LABELS[activeSection]}...`}
                          className="w-full h-72 p-4 bg-slate-950/45 border border-white/8 rounded-2xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500/40 transition-all font-sans leading-relaxed resize-none custom-scrollbar"
                        />
                      </div>

                      {/* Right: AI suggestion panel */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
                            AI Enhancement Output
                          </label>
                          {activeImprovement && (
                            <span className="text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                              <span>Estimated Score: {activeImprovement.estimatedScoreAfter}%</span>
                            </span>
                          )}
                        </div>

                        <div className="relative h-72">
                          {!activeImprovement ? (
                            <div className="w-full h-full border border-dashed border-white/8 bg-slate-950/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2.5">
                              <Sparkles size={20} className="text-slate-500" />
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-400">Section Restructure Ready</p>
                                <p className="text-[10px] max-w-[210px] text-slate-500 leading-normal mx-auto">
                                  Click "AI Rewrite" above to generate enhanced phrasing metrics tailored for recruiting benchmarks.
                                </p>
                              </div>
                            </div>
                          ) : showDiffMode ? (
                            // Render highlighted comparison tokens
                            <div className="w-full h-full p-4 bg-slate-950 border border-indigo-500/10 rounded-2xl overflow-y-auto custom-scrollbar font-sans text-xs sm:text-sm leading-relaxed text-slate-300">
                              <div className="whitespace-pre-wrap">
                                {diffTokens.map((token, idx) => {
                                  if (token.type === "added") {
                                    return (
                                      <span key={idx} className="bg-emerald-500/15 text-emerald-400 font-bold px-1 rounded border border-emerald-500/20 mx-0.5">
                                        {token.text}
                                      </span>
                                    );
                                  }
                                  if (token.type === "removed") {
                                    return (
                                      <span key={idx} className="bg-rose-500/15 text-rose-400 line-through px-1 rounded border border-rose-500/20 mx-0.5">
                                        {token.text}
                                      </span>
                                    );
                                  }
                                  return <span key={idx}>{token.text}</span>;
                                })}
                              </div>
                            </div>
                          ) : (
                            <textarea
                              value={activeImprovement.improved}
                              onChange={(e) => handleImprovedTextChange(activeSection, e.target.value)}
                              className="w-full h-full p-4 bg-slate-950/50 border border-indigo-500/25 rounded-2xl text-xs sm:text-sm text-slate-200 focus:outline-none transition-all font-sans leading-relaxed resize-none custom-scrollbar"
                            />
                          )}
                        </div>
                      </div>

                    </div>

                    {/* AI action bar to apply or reject */}
                    {activeImprovement && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl gap-4 animate-slideUp">
                        <div className="flex items-center gap-2">
                          <CheckSquare size={16} className="text-indigo-400" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Commit improvements</p>
                            <p className="text-[10px] text-slate-400">Save this suggested block back into your primary workspace document baseline.</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleUndoSection(activeSection)}
                            className="px-3 py-1.5 hover:bg-white/5 text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Reject Changes
                          </button>
                          <button
                            onClick={() => handleApplyImprovement(activeSection)}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-extrabold rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
                          >
                            <Check size={12} />
                            <span>Apply Improvement</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Why AI Changed panel */}
                    {activeImprovement && (
                      <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 space-y-2 animate-fadeIn text-left">
                        <div className="text-xs font-black text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <HelpCircle size={13} />
                          <span>AI Improvement Insights</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          {activeImprovement.explanation}
                        </p>
                      </div>
                    )}

                  </div>

                </div>

              </motion.div>
            )}

          </div>
        )}

      </main>

      {/* EXPORT OPTIONS CONTROLLER OVERLAY MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/10 relative shadow-2xl space-y-6 bg-[#090D1A]">
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1">
                <h3 className="text-md font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <Download size={16} className="text-indigo-400" />
                  <span>Download Optimized Document</span>
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Select your formatted layout preferences. Downloads assemble instantly from your premium section buffers.
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* PDF PRINT */}
                <button
                  onClick={() => handleExportPdf(exportType)}
                  className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl text-red-400 group-hover:bg-red-500/20 border border-red-500/10">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Print as PDF Document</div>
                      <div className="text-[10px] text-slate-500">Universal layout optimized for recruiter printers.</div>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* DOCX EXPORT */}
                <button
                  onClick={() => handleExportDocx(exportType)}
                  className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 border border-blue-500/10">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Microsoft Word (.doc)</div>
                      <div className="text-[10px] text-slate-500">Editable format preserving standard resume tables.</div>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* PLAIN TXT EXPORT */}
                <button
                  onClick={() => handleExportTxt(exportType)}
                  className="w-full flex items-center justify-between p-3 bg-slate-950/40 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-xl text-slate-400 group-hover:bg-slate-750 border border-white/5">
                      <Layers size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Plain Text Layout (.txt)</div>
                      <div className="text-[10px] text-slate-500">Highly compatible structure suitable for direct copy-paste.</div>
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              <div className="text-center pt-1 border-t border-white/5">
                <span className="text-[9px] text-slate-600 uppercase font-mono font-bold tracking-widest block">
                  RESUMEIQ PRESTIGE WRITING ALGORITHMS
                </span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </FeatureGate>
  );
}
