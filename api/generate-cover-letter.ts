import type { VercelRequest, VercelResponse } from "@vercel/node";
import { generateCoverLetter } from "../src/server/geminiService";

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

    const coverLetter = await generateCoverLetter(resumeText, targetRole, jobDescription, jobPreferences);
    res.status(200).json({ coverLetter });
  } catch (error: any) {
    console.error("Vercel /api/generate-cover-letter error:", error);
    res.status(500).json({ error: error.message || "An error occurred during cover letter generation." });
  }
}
