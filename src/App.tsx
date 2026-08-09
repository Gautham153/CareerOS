/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import WorkspaceLayout from "./components/WorkspaceLayout";
import Landing from "./pages/Landing";
import Workspace from "./pages/Workspace";
import Dashboard from "./pages/Dashboard";
import Improve from "./pages/Improve";
import HistoryPage from "./pages/HistoryPage";
import JobMatch from "./pages/JobMatch";
import ResumeRewriter from "./pages/ResumeRewriter";
import InterviewCoach from "./pages/InterviewCoach";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AnalyticalReports from "./pages/AnalyticalReports";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import CareerRoadmap from "./pages/CareerRoadmap";

export default function App() {
  return (
    <AppProvider>
      <AnalysisProvider>
        <BrowserRouter>
          <WorkspaceLayout>
          <Routes>
            {/* Main Home Workspace Route */}
            <Route path="/" element={<Landing />} />

            {/* Dedicated Workspace Page */}
            <Route path="/workspace" element={<Workspace />} />

            {/* Resume upload/parsing workspace interface */}
            <Route path="/analyzer" element={<ResumeAnalyzer />} />

            {/* Core workspace dashboard with score breakdowns */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Pricing details page */}
            <Route path="/pricing" element={<Pricing />} />

            {/* Subscription Checkout Flow */}
            <Route path="/checkout" element={<Checkout />} />

            {/* AI-powered bullet-point improver built on the Google X-Y-Z formula */}
            <Route path="/improve" element={<Improve />} />

            {/* Client-side history of past analyzed resume results */}
            <Route path="/history" element={<HistoryPage />} />

            {/* AI Job Match Engine matching resume against a target job description */}
            <Route path="/job-match" element={<JobMatch />} />

            {/* AI Interview Coach */}
            <Route path="/interview-coach" element={<InterviewCoach />} />

            {/* AI Resume Rewriter page */}
            <Route path="/rewriter" element={<ResumeRewriter />} />

            {/* AI Career Roadmap */}
            <Route path="/career-roadmap" element={<CareerRoadmap />} />

            {/* ATS Analytical Reports */}
            <Route path="/reports" element={<AnalyticalReports />} />

            {/* Fallback routing for non-existent paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WorkspaceLayout>
      </BrowserRouter>
    </AnalysisProvider>
  </AppProvider>
  );
}
