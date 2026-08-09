import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateInterviewPrep } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { resumeText, targetRole, jobDescription, jobPreferences } = req.body || {};

    if (!resumeText) {
      res.status(400).json({ error: "Missing required parameter: resumeText is required." });
      return;
    }

    const prep = await generateInterviewPrep(resumeText, targetRole, jobDescription, jobPreferences);
    res.status(200).json({ prep });
  } catch (error: any) {
    console.error("Vercel /api/generate-interview-prep error:", error);
    res.status(500).json({ error: error.message || "An error occurred during interview prep generation." });
  }
}
