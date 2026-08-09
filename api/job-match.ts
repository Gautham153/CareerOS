import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeJobMatch } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { resumeText, jobDescription, targetRole, jobPreferences } = req.body || {};

    if (!resumeText) {
      res.status(400).json({ error: "Missing required parameter: resumeText is required." });
      return;
    }

    const matchResult = await analyzeJobMatch(
      resumeText,
      jobDescription || "",
      targetRole,
      jobPreferences
    );
    res.status(200).json(matchResult);
  } catch (error: any) {
    console.error("Vercel /api/job-match error:", error);
    res.status(500).json({ error: error.message || "An error occurred during job matching analysis." });
  }
}
