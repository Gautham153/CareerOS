import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateCoachQuestions } from "../../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const {
      resumeText,
      optimizedResumeText,
      targetRole,
      jobDescription,
      jobMatchResults,
      interviewType,
      difficulty,
      style,
      company,
      count
    } = req.body || {};

    if (!resumeText) {
      res.status(400).json({ error: "Missing required parameter: resumeText is required." });
      return;
    }

    const questions = await generateCoachQuestions({
      resumeText,
      optimizedResumeText,
      targetRole,
      jobDescription,
      jobMatchResults,
      interviewType: interviewType || "Mixed Interview",
      difficulty: difficulty || "Medium",
      style: style || "Professional",
      company: company || "General",
      count: count || 5
    });

    res.status(200).json({ questions });
  } catch (error: any) {
    console.error("Vercel /api/coach/questions error:", error);
    res.status(500).json({ error: error.message || "An error occurred during question generation." });
  }
}
