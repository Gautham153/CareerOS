import type { VercelRequest, VercelResponse } from "@vercel/node";
import { evaluateCoachAnswer } from "../../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const {
      question,
      expectedPoints,
      userAnswer,
      resumeText,
      targetRole,
      jobDescription,
      interviewType,
      difficulty,
      style
    } = req.body || {};

    if (!question || !resumeText) {
      res.status(400).json({ error: "Missing required parameters: question and resumeText are required." });
      return;
    }

    const evaluation = await evaluateCoachAnswer({
      question,
      expectedPoints: expectedPoints || [],
      userAnswer: userAnswer || "",
      resumeText,
      targetRole,
      jobDescription,
      interviewType: interviewType || "Mixed Interview",
      difficulty: difficulty || "Medium",
      style: style || "Professional"
    });

    res.status(200).json({ evaluation });
  } catch (error: any) {
    console.error("Vercel /api/coach/evaluate error:", error);
    res.status(500).json({ error: error.message || "An error occurred during response evaluation." });
  }
}
