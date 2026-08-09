import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateCareerRoadmap } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { resumeText, careerGoal, experienceLevel, targetTimeline } = req.body || {};

    if (!careerGoal) {
      res.status(400).json({ error: "Missing required parameter: careerGoal is required." });
      return;
    }

    const result = await generateCareerRoadmap({
      resumeText: resumeText || "",
      careerGoal,
      experienceLevel: experienceLevel || "Intermediate",
      targetTimeline: targetTimeline || "6 Months"
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel /api/career-roadmap error:", error);
    res.status(500).json({ error: error.message || "An error occurred during career roadmap generation." });
  }
}
