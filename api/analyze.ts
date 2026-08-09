import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeResumeText } from "../src/server/geminiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { text, wordCount, fileName } = req.body || {};

    if (!text || !fileName) {
      res.status(400).json({ error: "Missing required parameters: text and fileName are required." });
      return;
    }

    const wordCountInt = wordCount ? parseInt(wordCount, 10) : text.split(/\s+/).length;
    const analysisResult = await analyzeResumeText(text, wordCountInt, fileName);

    res.status(200).json(analysisResult);
  } catch (error: any) {
    console.error("Vercel /api/analyze error:", error);

    const errMsg = error.message || "";
    if (errMsg.startsWith("ANALYSIS_FAILED_DETAILS:")) {
      try {
        const details = JSON.parse(errMsg.substring("ANALYSIS_FAILED_DETAILS:".length));
        res.status(500).json({
          error: `Gemini AI Resume analysis failed: ${details.message}`,
          details
        });
        return;
      } catch {
        // Fallback if JSON parsing fails
      }
    }

    res.status(500).json({ error: error.message || "An error occurred during resume analysis." });
  }
}
